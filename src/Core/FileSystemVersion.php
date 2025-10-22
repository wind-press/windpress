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
 * Manages file version history using filesystem-based storage.
 *
 * Stores version snapshots in /wp-content/uploads/windpress/volume/versions/
 * Each file has its own directory with versioned copies and a manifest.json
 *
 * @since 3.4.0
 */
class FileSystemVersion
{
    /**
     * Base directory for data files.
     */
    private string $data_dir;

    /**
     * Directory for version storage.
     */
    private string $versions_dir;

    /**
     * Initialize with directory paths.
     *
     * @param string $data_dir Path to data directory (e.g., /wp-content/uploads/windpress/data)
     * @param string $volume_dir Path to volume metadata directory (e.g., /wp-content/uploads/windpress/volume)
     */
    public function __construct(string $data_dir, string $volume_dir)
    {
        $this->data_dir = rtrim($data_dir, '/');
        $this->versions_dir = rtrim($volume_dir, '/') . '/versions';
    }

    /**
     * Create a version snapshot for a file.
     *
     * @param string $relative_path Relative path from data directory (e.g., "main.css" or "components/button.css")
     * @param string $content File content to snapshot
     * @param string $message Optional message describing the change
     * @param string $user Optional username who made the change
     * @return int The new version number
     */
    public function create_version(string $relative_path, string $content, string $message = '', string $user = ''): int
    {
        $version_dir = $this->get_version_dir($relative_path);

        // Ensure directory exists
        if (!file_exists($version_dir)) {
            wp_mkdir_p($version_dir);
        }

        // Load manifest
        $manifest = $this->load_manifest($relative_path);

        // Increment version
        $version_number = ($manifest['current_version'] ?? 0) + 1;

        // Create version file
        $timestamp = gmdate('Ymd_His');
        $extension = pathinfo($relative_path, PATHINFO_EXTENSION);
        $version_file = sprintf(
            'v%03d_%s.%s',
            $version_number,
            $timestamp,
            $extension
        );

        $version_path = $version_dir . '/' . $version_file;
        file_put_contents($version_path, $content);

        // Update manifest
        $manifest['current_version'] = $version_number;
        $manifest['versions'][] = [
            'version' => $version_number,
            'file' => $version_file,
            'timestamp' => time(),
            'size' => strlen($content),
            'checksum' => hash('sha256', $content),
            'message' => $message ?: 'Version ' . $version_number,
            'user' => $user ?: wp_get_current_user()->user_login,
        ];

        // Keep only last 50 versions (configurable via filter)
        $max_versions = apply_filters('f!windpress/core/filesystem_version:max_versions', 50);

        if (count($manifest['versions']) > $max_versions) {
            $to_delete = array_shift($manifest['versions']);
            @unlink($version_dir . '/' . $to_delete['file']);
        }

        $this->save_manifest($relative_path, $manifest);

        return $version_number;
    }

    /**
     * Get all versions for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return array Array of version metadata
     */
    public function get_versions(string $relative_path): array
    {
        $manifest = $this->load_manifest($relative_path);
        return $manifest['versions'] ?? [];
    }

    /**
     * Get content of a specific version.
     *
     * @param string $relative_path Relative path from data directory
     * @param int $version Version number to retrieve
     * @return string|null File content or null if not found
     */
    public function get_version_content(string $relative_path, int $version): ?string
    {
        $manifest = $this->load_manifest($relative_path);

        foreach ($manifest['versions'] ?? [] as $v) {
            if ($v['version'] === $version) {
                $content = @file_get_contents($this->get_version_dir($relative_path) . '/' . $v['file']);
                return $content !== false ? $content : null;
            }
        }

        return null;
    }

    /**
     * Get metadata for a specific version.
     *
     * @param string $relative_path Relative path from data directory
     * @param int $version Version number
     * @return array|null Version metadata or null if not found
     */
    public function get_version_metadata(string $relative_path, int $version): ?array
    {
        $manifest = $this->load_manifest($relative_path);

        foreach ($manifest['versions'] ?? [] as $v) {
            if ($v['version'] === $version) {
                return $v;
            }
        }

        return null;
    }

    /**
     * Restore a version (writes to data directory and creates new version).
     *
     * @param string $relative_path Relative path from data directory
     * @param int $version Version number to restore
     * @return bool True on success, false on failure
     */
    public function restore_version(string $relative_path, int $version): bool
    {
        $content = $this->get_version_content($relative_path, $version);

        if ($content === null) {
            return false;
        }

        // Save to active file in data directory
        $active_path = $this->data_dir . '/' . $relative_path;

        // Ensure directory exists
        $active_dir = dirname($active_path);
        if (!file_exists($active_dir)) {
            wp_mkdir_p($active_dir);
        }

        file_put_contents($active_path, $content);

        // Create new version marking the restore
        $this->create_version(
            $relative_path,
            $content,
            "Restored from version $version"
        );

        return true;
    }

    /**
     * Delete all versions for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return bool True on success
     */
    public function delete_versions(string $relative_path): bool
    {
        $version_dir = $this->get_version_dir($relative_path);

        if (!file_exists($version_dir)) {
            return true;
        }

        // Delete all version files
        $files = glob($version_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }

        // Remove directory
        @rmdir($version_dir);

        // Remove parent directory if empty
        $parent_dir = dirname($version_dir);
        if (is_dir($parent_dir) && count(scandir($parent_dir)) === 2) { // Only . and ..
            @rmdir($parent_dir);
        }

        return true;
    }

    /**
     * Get the version directory for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return string Full path to version directory
     */
    private function get_version_dir(string $relative_path): string
    {
        $dir = dirname($relative_path);
        $filename = pathinfo($relative_path, PATHINFO_FILENAME);

        if ($dir === '.') {
            return $this->versions_dir . '/' . $filename;
        }

        return $this->versions_dir . '/' . $dir . '/' . $filename;
    }

    /**
     * Load manifest for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return array Manifest data
     */
    private function load_manifest(string $relative_path): array
    {
        $manifest_path = $this->get_version_dir($relative_path) . '/manifest.json';

        if (!file_exists($manifest_path)) {
            return [
                'current_version' => 0,
                'versions' => [],
            ];
        }

        $content = file_get_contents($manifest_path);
        $data = json_decode($content, true);

        return is_array($data) ? $data : [
            'current_version' => 0,
            'versions' => [],
        ];
    }

    /**
     * Save manifest for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @param array $manifest Manifest data to save
     * @return void
     */
    private function save_manifest(string $relative_path, array $manifest): void
    {
        $manifest_path = $this->get_version_dir($relative_path) . '/manifest.json';
        file_put_contents($manifest_path, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
