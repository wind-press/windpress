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

use Symfony\Component\Filesystem\Path;
use Symfony\Component\Finder\Finder;
use WIND_PRESS;
use WindPress\WindPress\Utils\Common;

/**
 * @since 3.1.11
 */
class Volume
{
    /**
     * FileSystemVersion instance.
     */
    private static ?FileSystemVersion $version_manager = null;

    /**
     * FileSystemMeta instance.
     */
    private static ?FileSystemMeta $meta_manager = null;

    /**
     * Get FileSystemVersion instance.
     */
    private static function get_version_manager(): FileSystemVersion
    {
        if (self::$version_manager === null) {
            self::$version_manager = new FileSystemVersion(
                static::data_dir_path(),
                static::volume_dir_path()
            );
        }
        return self::$version_manager;
    }

    /**
     * Get FileSystemMeta instance.
     */
    private static function get_meta_manager(): FileSystemMeta
    {
        if (self::$meta_manager === null) {
            self::$meta_manager = new FileSystemMeta(
                static::volume_dir_path()
            );
        }
        return self::$meta_manager;
    }

    public static function get_entries(): array
    {
        $entries = [];
        $meta = self::get_meta_manager();
        $version = self::get_version_manager();

        $data_dir = static::data_dir_path();

        if (! file_exists($data_dir)) {
            wp_mkdir_p($data_dir);
        }

        $finder = new Finder();

        $finder
            ->ignoreUnreadableDirs()
            ->in($data_dir)
            ->files()
            ->followLinks()
            ->name(['*.css', '*.js']);

        do_action('a!windpress/core/volume:get_entries.finder', $finder);

        foreach ($finder as $file) {
            if (! is_readable($file->getPathname())) {
                continue;
            }

            $relative_path = $file->getRelativePathname();
            $content = $file->getContents();

            // Calculate current checksum
            $current_checksum = $meta->calculate_checksum($content);
            $stored_checksum = $meta->get_checksum($relative_path);

            // Detect external changes
            if ($stored_checksum && $stored_checksum !== $current_checksum) {
                // Auto-create version snapshot for external modification
                $version->create_version(
                    $relative_path,
                    $content,
                    'External modification detected',
                    'local'
                );
            }

            // Update metadata
            $meta->update_checksum($relative_path, $current_checksum);

            $entries[] = [
                'name' => $file->getFilename(),
                'relative_path' => $relative_path,
                'content' => $content,
                'handler' => 'internal',
                'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, $relative_path)),
                'version_token' => $current_checksum, // For conflict detection
                'readonly' => strpos(wp_normalize_path($file->getPathname()), wp_normalize_path($data_dir)) === false,
                'path_on_disk' => $file->getPathname(),
            ];
        }

        $tailwindcss_version = Runtime::tailwindcss_version();

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file
        $stubs_main_css = file_get_contents(sprintf('%s/stubs/tailwindcss-v%d/main.css', dirname(WIND_PRESS::FILE), $tailwindcss_version));

        // check if 'main.css' already exists and content is not empty, else use the stubs
        $main_css_key = array_search('main.css', array_column($entries, 'name'), true);

        if ($main_css_key === false) {
            $entries[] = [
                'name' => 'main.css',
                'relative_path' => 'main.css',
                'content' => $stubs_main_css,
                'handler' => 'internal',
                'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, 'main.css')),
            ];
        } elseif (empty($entries[$main_css_key]['content'])) {
            $entries[$main_css_key]['content'] = $stubs_main_css;
        }

        if ($tailwindcss_version === 3) {
            $stubs_tailwind_config_js = file_get_contents(dirname(WIND_PRESS::FILE) . '/stubs/tailwindcss-v3/tailwind.config.js');
            $stubs_wizard_js = file_get_contents(dirname(WIND_PRESS::FILE) . '/stubs/tailwindcss-v3/wizard.js');

            // check if 'tailwind.config.js' already exists and content is not empty, else use the stubs
            $tailwind_config_js_key = array_search('tailwind.config.js', array_column($entries, 'name'), true);

            if ($tailwind_config_js_key === false) {
                $entries[] = [
                    'name' => 'tailwind.config.js',
                    'relative_path' => 'tailwind.config.js',
                    'content' => $stubs_tailwind_config_js,
                    'handler' => 'internal',
                    'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, 'tailwind.config.js')),
                ];
            } elseif (empty($entries[$tailwind_config_js_key]['content'])) {
                $entries[$tailwind_config_js_key]['content'] = $stubs_tailwind_config_js;
            }

            // check if 'wizard.js' already exists and content is not empty, else use the stubs
            $wizard_js_key = array_search('wizard.js', array_column($entries, 'name'), true);

            if ($wizard_js_key === false) {
                $entries[] = [
                    'name' => 'wizard.js',
                    'relative_path' => 'wizard.js',
                    'content' => $stubs_wizard_js,
                    'handler' => 'internal',
                    'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, 'wizard.js')),
                ];
            } elseif (empty($entries[$wizard_js_key]['content'])) {
                $entries[$wizard_js_key]['content'] = $stubs_wizard_js;
            }
        } elseif ($tailwindcss_version === 4) {
            $stubs_wizard_css = file_get_contents(dirname(WIND_PRESS::FILE) . '/stubs/tailwindcss-v4/wizard.css');

            // check if 'wizard.css' already exists and content is not empty, else use the stubs
            $wizard_css_key = array_search('wizard.css', array_column($entries, 'name'), true);

            if ($wizard_css_key === false) {
                $entries[] = [
                    'name' => 'wizard.css',
                    'relative_path' => 'wizard.css',
                    'content' => $stubs_wizard_css,
                    'handler' => 'internal',
                    'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, 'wizard.css')),
                ];
            } elseif (empty($entries[$wizard_css_key]['content'])) {
                $entries[$wizard_css_key]['content'] = $stubs_wizard_css;
            }
        }

        /**
         * @param array $entries The list of volume's entries. Each volume have `name`, `relative_path`, `content`, `handler`, and `signature` keys.
         */
        return apply_filters('f!windpress/core/volume:get_entries.entries', $entries);
    }

    public static function save_entries($entries)
    {
        if (! is_array($entries)) {
            return [
                'success' => false,
                'error' => 'Invalid entries data',
            ];
        }

        $data_dir = static::data_dir_path();
        $meta = self::get_meta_manager();
        $version = self::get_version_manager();

        // Create transaction for atomic writes
        $transaction = new FileSystemTransaction(
            static::data_dir_path(),
            static::volume_dir_path()
        );

        $transaction->begin();
        $conflicts = [];

        foreach ($entries as $entry) {
            // if doesn't have any of the following keys, skip: name, relative_path, content, handler
            if (! isset($entry['name'], $entry['relative_path'], $entry['content'], $entry['handler'])) {
                continue;
            }

            // skip the readonly entries
            if (isset($entry['readonly']) && $entry['readonly']) {
                continue;
            }

            if ($entry['handler'] !== 'internal') {
                // the handler only accept alphanumeric, hyphens, and underscores
                if (! preg_match('/^[a-zA-Z0-9_-]+$/', $entry['handler'])) {
                    continue;
                }

                do_action('a!windpress/core/volume:save_entries.entry', $entry);

                // use specific handler instead for efficient handling
                do_action('a!windpress/core/volume:save_entries.entry.' . $entry['handler'], $entry);

                continue;
            }

            // if the signature is not set, it is a new entry.
            if (! isset($entry['signature'])) {
                // sanitize the file name.
                add_filter('sanitize_file_name_chars', [static::class, 'sanitize_file_name_chars'], 10, 2);
                // split the path, and sanitize each part.
                $entry['relative_path'] = implode('/', array_map('sanitize_file_name', explode('/', $entry['relative_path'])));
                $entry['relative_path'] = sanitize_file_name($entry['relative_path']);
                remove_filter('sanitize_file_name_chars', [static::class, 'sanitize_file_name_chars'], 10);

                $entry['name'] = pathinfo($entry['relative_path'], PATHINFO_BASENAME);

                // only handle a css and js files.
                if (! in_array(pathinfo($entry['name'], PATHINFO_EXTENSION), ['css', 'js'], true)) {
                    continue;
                }

                $entry['signature'] = wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, $entry['relative_path']));
            }

            // verify the signature
            if (! wp_verify_nonce($entry['signature'], sprintf('%s:%s', WIND_PRESS::WP_OPTION, $entry['relative_path']))) {
                continue;
            }

            try {
                // Sanitize and validate the path to prevent directory traversal
                $safe_file_path = static::sanitize_relative_path($entry['relative_path'], $data_dir);
                $relative_path = $entry['relative_path'];
                $content = $entry['content'];
                // $version_token = $entry['version_token'] ?? null; // Unused - conflict detection disabled

                // TODO: Future - Implement conflict resolution with proper merge strategies
                // Current implementation: Auto-overwrite (last write wins)
                // Future improvements:
                // - Detect conflicts when version_token doesn't match disk_checksum
                // - Return 409 with conflict details (your_content, disk_content, checksums)
                // - Let user choose resolution strategy (keep yours, keep disk, manual merge)
                // - Implement three-way merge for intelligent conflict resolution
                //
                // For now, we skip conflict detection and always overwrite the file.
                // This prevents the infinite 409 loop but loses the safety of conflict detection.

                // Check for external conflicts (disabled for now)
                if (file_exists($safe_file_path)) {
                    $disk_content = file_get_contents($safe_file_path);
                    // $disk_checksum = $meta->calculate_checksum($disk_content); // Unused - conflict detection disabled

                    // DISABLED: Conflict detection
                    // if ($version_token && $version_token !== $disk_checksum) {
                    //     $conflicts[] = [
                    //         'path' => $relative_path,
                    //         'your_content' => $content,
                    //         'disk_content' => $disk_content,
                    //         'disk_checksum' => $disk_checksum,
                    //     ];
                    //     continue;
                    // }

                    // Create version before saving (if content changed)
                    if ($disk_content !== $content && !empty($content)) {
                        $version->create_version(
                            $relative_path,
                            $disk_content,
                            'Before save'
                        );
                    }
                }

                // if the content is empty, delete the file.
                if (empty($content)) {
                    $transaction->delete($relative_path);
                    $meta->remove($relative_path);
                    // Also delete version history for this file
                    $version->delete_versions($relative_path);
                } else {
                    // Stage write in transaction
                    $transaction->write($relative_path, $content);

                    // Calculate new checksum for metadata
                    $new_checksum = $meta->calculate_checksum($content);
                    $meta->update_checksum($relative_path, $new_checksum);
                }
            } catch (\Throwable $th) {
                if (WP_DEBUG_LOG) {
                    error_log($th->__toString());
                }
                $transaction->rollback();
                return [
                    'success' => false,
                    'error' => $th->getMessage(),
                ];
            }
        }

        // If conflicts detected, abort transaction
        if (!empty($conflicts)) {
            $transaction->rollback();
            return [
                'success' => false,
                'conflicts' => $conflicts,
            ];
        }

        // Commit all writes atomically
        try {
            $transaction->commit();
            return ['success' => true];
        } catch (\Throwable $th) {
            if (WP_DEBUG_LOG) {
                error_log($th->__toString());
            }
            return [
                'success' => false,
                'error' => $th->getMessage(),
            ];
        }
    }

    public static function sanitize_file_name_chars(array $special_chars, $filename_raw)
    {
        // allow dir
        return array_diff($special_chars, ['/']);
    }

    /**
     * Sanitize and validate a relative path to prevent directory traversal attacks.
     *
     * @param string $relative_path The relative path to sanitize
     * @param string $base_dir The base directory that the path should be contained within
     * @return string The sanitized and validated absolute path
     * @throws \InvalidArgumentException If the path attempts to escape the base directory
     * @since 3.3.65
     */
    private static function sanitize_relative_path(string $relative_path, string $base_dir): string
    {
        // Remove any null bytes
        $relative_path = str_replace("\0", '', $relative_path);

        // Canonicalize the base directory path
        $base_dir = Path::canonicalize($base_dir);

        // Canonicalize the relative path to resolve .. and normalize separators
        $canonical_path = Path::canonicalize($relative_path);

        // Build the full path
        $full_path = Path::join($base_dir, $canonical_path);

        // Validate that the resolved path doesn't escape the base directory
        if (! str_starts_with($full_path, $base_dir . DIRECTORY_SEPARATOR)) {
            throw new \InvalidArgumentException('Path traversal attempt detected: ' . $relative_path);
        }

        return $full_path;
    }

    public static function data_dir_url(): string
    {
        return wp_upload_dir()['baseurl'] . WIND_PRESS::DATA_DIR;
    }

    public static function data_dir_path(): string
    {
        return wp_upload_dir()['basedir'] . WIND_PRESS::DATA_DIR;
    }

    public static function volume_dir_path(): string
    {
        return wp_upload_dir()['basedir'] . WIND_PRESS::VOLUME_DIR;
    }

    public static function get_available_handlers(): array
    {
        return apply_filters('f!windpress/core/volume:get_available_handlers', []);
    }

    /**
     * Cleanup orphaned metadata for files that no longer exist on disk.
     *
     * @return array Array with 'cleaned_meta' and 'cleaned_versions' counts
     * @since 3.4.0
     */
    public static function cleanup_orphaned_metadata(): array
    {
        $meta = self::get_meta_manager();
        $version = self::get_version_manager();
        $data_dir = static::data_dir_path();

        $cleaned_meta = 0;
        $cleaned_versions = 0;

        // Get all tracked files from metadata
        $tracked_files = $meta->get_all_files();

        foreach ($tracked_files as $relative_path) {
            $full_path = $data_dir . '/' . $relative_path;

            // If file doesn't exist on disk, clean up metadata
            if (!file_exists($full_path)) {
                $meta->remove($relative_path);
                $version->delete_versions($relative_path);
                $cleaned_meta++;
                $cleaned_versions++;
            }
        }

        return [
            'cleaned_meta' => $cleaned_meta,
            'cleaned_versions' => $cleaned_versions,
        ];
    }

    /**
     * Get version history for a file.
     *
     * @param string $relative_path Relative path from data directory
     * @return array Array of version metadata
     * @since 3.4.0
     */
    public static function get_versions(string $relative_path): array
    {
        $version = self::get_version_manager();
        return $version->get_versions($relative_path);
    }

    /**
     * Get content of a specific version.
     *
     * @param string $relative_path Relative path from data directory
     * @param int $version Version number
     * @return string|null Version content or null if not found
     * @since 3.4.0
     */
    public static function get_version_content(string $relative_path, int $version): ?string
    {
        $version_manager = self::get_version_manager();
        return $version_manager->get_version_content($relative_path, $version);
    }

    /**
     * Restore a specific version.
     *
     * @param string $relative_path Relative path from data directory
     * @param int $version Version number to restore
     * @return bool True on success
     * @since 3.4.0
     */
    public static function restore_version(string $relative_path, int $version): bool
    {
        $version_manager = self::get_version_manager();
        $meta = self::get_meta_manager();

        $result = $version_manager->restore_version($relative_path, $version);

        if ($result) {
            // Update metadata after restore
            $content = $version_manager->get_version_content($relative_path, $version);
            if ($content !== null) {
                $checksum = $meta->calculate_checksum($content);
                $meta->update_checksum($relative_path, $checksum);
            }
        }

        return $result;
    }
}
