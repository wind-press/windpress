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
 * Manages file metadata and checksums for external change detection.
 *
 * Stores metadata in /wp-content/uploads/windpress/volume/meta/files.json
 *
 * @since 3.4.0
 */
class FileSystemMeta
{
    /**
     * Path to metadata file.
     */
    private string $meta_file;

    /**
     * In-memory cache of metadata.
     */
    private ?array $cache = null;

    /**
     * Initialize with volume directory path.
     *
     * @param string $volume_dir Path to volume metadata directory (e.g., /wp-content/uploads/windpress/volume)
     */
    public function __construct(string $volume_dir)
    {
        $meta_dir = rtrim($volume_dir, '/') . '/meta';
        $this->meta_file = $meta_dir . '/files.json';

        // Ensure directory exists
        if (!file_exists($meta_dir)) {
            wp_mkdir_p($meta_dir);
        }
    }

    /**
     * Get stored checksum for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return string|null Checksum or null if not found
     */
    public function get_checksum(string $relative_path): ?string
    {
        $data = $this->load();
        return $data[$relative_path]['checksum'] ?? null;
    }

    /**
     * Get stored modified timestamp for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return int|null Unix timestamp or null if not found
     */
    public function get_modified(string $relative_path): ?int
    {
        $data = $this->load();
        return $data[$relative_path]['modified'] ?? null;
    }

    /**
     * Get all metadata for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return array|null Metadata array or null if not found
     */
    public function get_metadata(string $relative_path): ?array
    {
        $data = $this->load();
        return $data[$relative_path] ?? null;
    }

    /**
     * Update checksum for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @param string $checksum SHA256 checksum
     * @return void
     */
    public function update_checksum(string $relative_path, string $checksum): void
    {
        $data = $this->load();

        if (!isset($data[$relative_path])) {
            $data[$relative_path] = [];
        }

        $data[$relative_path]['checksum'] = $checksum;
        $data[$relative_path]['modified'] = time();

        $this->save($data);
    }

    /**
     * Update full metadata for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @param array $metadata Metadata to store
     * @return void
     */
    public function update_metadata(string $relative_path, array $metadata): void
    {
        $data = $this->load();
        $data[$relative_path] = array_merge(
            $data[$relative_path] ?? [],
            $metadata
        );
        $this->save($data);
    }

    /**
     * Remove file from metadata.
     *
     * @param string $relative_path Relative path from data directory
     * @return void
     */
    public function remove(string $relative_path): void
    {
        $data = $this->load();
        unset($data[$relative_path]);
        $this->save($data);
    }

    /**
     * Check if file exists in metadata.
     *
     * @param string $relative_path Relative path from data directory
     * @return bool
     */
    public function exists(string $relative_path): bool
    {
        $data = $this->load();
        return isset($data[$relative_path]);
    }

    /**
     * Get all tracked files.
     *
     * @return array Array of relative paths
     */
    public function get_all_files(): array
    {
        $data = $this->load();
        return array_keys($data);
    }

    /**
     * Calculate checksum from content.
     *
     * @param string $content File content
     * @return string SHA256 checksum
     */
    public function calculate_checksum(string $content): string
    {
        return hash('sha256', $content);
    }

    /**
     * Clear all metadata.
     *
     * @return void
     */
    public function clear(): void
    {
        $this->cache = [];
        $this->save([]);
    }

    /**
     * Load metadata from file.
     *
     * @return array Metadata array
     */
    private function load(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        if (!file_exists($this->meta_file)) {
            $this->cache = [];
            return $this->cache;
        }

        $content = file_get_contents($this->meta_file);
        $data = json_decode($content, true);

        $this->cache = is_array($data) ? $data : [];

        return $this->cache;
    }

    /**
     * Save metadata to file.
     *
     * @param array $data Metadata to save
     * @return void
     */
    private function save(array $data): void
    {
        $this->cache = $data;
        file_put_contents(
            $this->meta_file,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
}
