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

use Symfony\Component\Finder\Finder;
use WIND_PRESS;
use WindPress\WindPress\Utils\Common;

/**
 * @since 3.1.11
 */
class Volume
{
    public static function get_entries(): array
    {
        $entries = [];

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

            $entries[] = [
                'name' => $file->getFilename(),
                'relative_path' => $file->getRelativePathname(),
                'content' => $file->getContents(),
                'handler' => strpos($file->getPathname(), $data_dir) === false ? 'read-only' : 'internal',
                'signature' => wp_create_nonce(sprintf('%s:%s', WIND_PRESS::WP_OPTION, $file->getRelativePathname())),
            ];
        }

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file
        $stubs_main_css = file_get_contents(sprintf('%s/stubs/tailwindcss/main.css', dirname(WIND_PRESS::FILE)));

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

        /**
         * @param array $entries The list of volume's entries. Each volume have `name`, `relative_path`, `content`, `handler`, and `signature` keys.
         */
        return apply_filters('f!windpress/core/volume:get_entries.entries', $entries);
    }

    public static function save_entries($entries)
    {
        if (! is_array($entries)) {
            return;
        }

        $data_dir = static::data_dir_path();

        foreach ($entries as $entry) {
            // if doesn't have any of the following keys, skip: name, relative_path, content, handler
            if (! isset($entry['name'], $entry['relative_path'], $entry['content'], $entry['handler'])) {
                continue;
            }

            if ($entry['handler'] === 'read-only') {
                continue;
            }

            if ($entry['handler'] !== 'internal') {
                // only if the signature is set
                if (isset($entry['signature'])) {
                    // the handler only accept alphanumeric, hyphens, and underscores
                    if (! preg_match('/^[a-zA-Z0-9_-]+$/', $entry['handler'])) {
                        continue;
                    }

                    do_action('a!windpress/core/volume:save_entries.entry', $entry);

                    // use specific handler instead for efficient handling
                    do_action('a!windpress/core/volume:save_entries.entry.' . $entry['handler'], $entry);
                }

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
                // if the content is empty, delete the file.
                if (empty($entry['content'])) {
                    Common::delete_file($data_dir . $entry['relative_path']);
                } else {
                    Common::save_file($entry['content'], $data_dir . $entry['relative_path']);
                }
            } catch (\Throwable $th) {
                if (WP_DEBUG_LOG) {
                    error_log($th->__toString());
                }
            }
        }
    }

    public static function sanitize_file_name_chars(array $special_chars, $filename_raw)
    {
        // allow dir
        return array_diff($special_chars, ['/']);
    }

    public static function data_dir_url(): string
    {
        return wp_upload_dir()['baseurl'] . WIND_PRESS::DATA_DIR;
    }

    public static function data_dir_path(): string
    {
        return wp_upload_dir()['basedir'] . WIND_PRESS::DATA_DIR;
    }
}
