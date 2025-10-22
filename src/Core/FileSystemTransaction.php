<?php

/*
 * This file is part of the WindPress package.
 *
 * (c) Joshua Gugun Siagian <suabahasa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare(strict_types=1);

namespace WindPress\WindPress\Core;

/**
 * Provides atomic file write operations using staging directory.
 *
 * Uses /wp-content/uploads/windpress/volume/transactions/ for staging
 *
 * @since 3.4.0
 */
class FileSystemTransaction
{
    /**
     * Base directory for data files.
     */
    private string $data_dir;

    /**
     * Directory for transaction staging.
     */
    private string $transactions_dir;

    /**
     * Staged operations.
     */
    private array $operations = [];

    /**
     * Current transaction temporary directory.
     */
    private ?string $temp_dir = null;

    /**
     * Transaction ID.
     */
    private ?string $transaction_id = null;

    /**
     * Initialize with directory paths.
     *
     * @param string $data_dir Path to data directory (e.g., /wp-content/uploads/windpress/data)
     * @param string $volume_dir Path to volume metadata directory (e.g., /wp-content/uploads/windpress/volume)
     */
    public function __construct(string $data_dir, string $volume_dir)
    {
        $this->data_dir = rtrim($data_dir, '/');
        $this->transactions_dir = rtrim($volume_dir, '/') . '/transactions';
    }

    /**
     * Begin a new transaction.
     *
     * @return void
     * @throws \RuntimeException If transaction already started
     */
    public function begin(): void
    {
        if ($this->temp_dir !== null) {
            throw new \RuntimeException('Transaction already started');
        }

        // Create unique transaction ID
        $this->transaction_id = 'tx_' . uniqid();

        // Create temp directory
        $this->temp_dir = $this->transactions_dir . '/' . $this->transaction_id;

        if (!file_exists($this->temp_dir)) {
            wp_mkdir_p($this->temp_dir);
        }

        $this->operations = [];
    }

    /**
     * Stage a write operation.
     *
     * @param string $relative_path Relative path from data directory
     * @param string $content File content to write
     * @return void
     * @throws \RuntimeException If transaction not started
     */
    public function write(string $relative_path, string $content): void
    {
        if ($this->temp_dir === null) {
            throw new \RuntimeException('Transaction not started');
        }

        // Handle nested paths
        $safe_path = str_replace(['/', '\\'], '_', $relative_path);
        $temp_file = $this->temp_dir . '/' . $safe_path;

        // Write to temp file
        file_put_contents($temp_file, $content);

        // Record operation
        $this->operations[] = [
            'type' => 'write',
            'source' => $temp_file,
            'target' => $this->data_dir . '/' . $relative_path,
            'relative_path' => $relative_path,
        ];
    }

    /**
     * Stage a delete operation.
     *
     * @param string $relative_path Relative path from data directory
     * @return void
     * @throws \RuntimeException If transaction not started
     */
    public function delete(string $relative_path): void
    {
        if ($this->temp_dir === null) {
            throw new \RuntimeException('Transaction not started');
        }

        $this->operations[] = [
            'type' => 'delete',
            'target' => $this->data_dir . '/' . $relative_path,
            'relative_path' => $relative_path,
        ];
    }

    /**
     * Commit all staged operations atomically.
     *
     * @return bool True on success
     * @throws \RuntimeException On commit failure
     */
    public function commit(): bool
    {
        if ($this->temp_dir === null) {
            throw new \RuntimeException('Transaction not started');
        }

        try {
            foreach ($this->operations as $op) {
                if ($op['type'] === 'write') {
                    // Ensure target directory exists
                    $target_dir = dirname($op['target']);
                    if (!file_exists($target_dir)) {
                        wp_mkdir_p($target_dir);
                    }

                    // Atomic move (rename on same filesystem)
                    if (!rename($op['source'], $op['target'])) {
                        throw new \RuntimeException("Failed to write {$op['target']}");
                    }
                } elseif ($op['type'] === 'delete') {
                    if (file_exists($op['target'])) {
                        if (!unlink($op['target'])) {
                            throw new \RuntimeException("Failed to delete {$op['target']}");
                        }
                    }
                }
            }

            // Cleanup temp directory
            $this->cleanup();

            return true;
        } catch (\Exception $e) {
            $this->rollback();
            throw $e;
        }
    }

    /**
     * Rollback transaction (discard all staged operations).
     *
     * @return void
     */
    public function rollback(): void
    {
        $this->cleanup();
    }

    /**
     * Get transaction ID.
     *
     * @return string|null Transaction ID or null if not started
     */
    public function get_id(): ?string
    {
        return $this->transaction_id;
    }

    /**
     * Get list of staged operations.
     *
     * @return array Array of operations
     */
    public function get_operations(): array
    {
        return $this->operations;
    }

    /**
     * Check if transaction is active.
     *
     * @return bool
     */
    public function is_active(): bool
    {
        return $this->temp_dir !== null;
    }

    /**
     * Cleanup temporary files and reset state.
     *
     * @return void
     */
    private function cleanup(): void
    {
        if ($this->temp_dir && file_exists($this->temp_dir)) {
            // Remove all files in temp dir
            $files = glob($this->temp_dir . '/*');
            if (is_array($files)) {
                foreach ($files as $file) {
                    if (is_file($file)) {
                        @unlink($file);
                    }
                }
            }

            // Remove directory
            @rmdir($this->temp_dir);
        }

        $this->temp_dir = null;
        $this->transaction_id = null;
        $this->operations = [];
    }

    /**
     * Cleanup old/abandoned transaction directories.
     *
     * This is a static utility method that can be called independently.
     *
     * @param string $volume_dir Path to volume metadata directory
     * @param int $max_age Maximum age in seconds (default: 1 hour)
     * @return int Number of directories cleaned up
     */
    public static function cleanup_old_transactions(string $volume_dir, int $max_age = 3600): int
    {
        $transactions_dir = rtrim($volume_dir, '/') . '/transactions';

        if (!file_exists($transactions_dir)) {
            return 0;
        }

        $cleaned = 0;
        $cutoff_time = time() - $max_age;

        $dirs = glob($transactions_dir . '/tx_*', GLOB_ONLYDIR);
        if (!is_array($dirs)) {
            return 0;
        }

        foreach ($dirs as $dir) {
            $mtime = filemtime($dir);

            if ($mtime < $cutoff_time) {
                // Remove all files
                $files = glob($dir . '/*');
                if (is_array($files)) {
                    foreach ($files as $file) {
                        if (is_file($file)) {
                            @unlink($file);
                        }
                    }
                }

                // Remove directory
                if (@rmdir($dir)) {
                    $cleaned++;
                }
            }
        }

        return $cleaned;
    }
}
