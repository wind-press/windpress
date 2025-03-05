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

use Exception;
use WIND_PRESS;
use WindPress\WindPress\Utils\AssetVite;
use WindPress\WindPress\Utils\Common;
use WindPress\WindPress\Utils\Config;

/**
 * @since 3.0.0
 */
class Runtime
{
    /**
     * Stores the instance, implementing a Singleton pattern.
     */
    private static self $instance;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private function __construct()
    {
    }

    /**
     * Singletons should not be cloneable.
     */
    private function __clone()
    {
    }

    /**
     * Singletons should not be restorable from strings.
     *
     * @throws Exception Cannot unserialize a singleton.
     */
    public function __wakeup()
    {
        throw new Exception('Cannot unserialize a singleton.');
    }

    /**
     * This is the static method that controls the access to the singleton
     * instance. On the first run, it creates a singleton object and places it
     * into the static property. On subsequent runs, it returns the client existing
     * object stored in the static property.
     */
    public static function get_instance(): self
    {
        if (! isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function init()
    {
        if (! is_admin()) {
            $is_prevent_load = apply_filters('f!windpress/core/runtime:is_prevent_load', false);

            if ($is_prevent_load) {
                return;
            }

            $this->append_header();
        }
    }

    public function append_header()
    {
        $is_cache_enabled = Config::get('performance.cache.enabled', false);
        $is_cache_enabled = apply_filters('f!windpress/core/runtime:append_header.cache_enabled', $is_cache_enabled);

        $is_exclude_admin = Config::get('performance.cache.exclude_admin', false) && current_user_can('manage_options');
        $is_exclude_admin = apply_filters('f!windpress/core/runtime:append_header.exclude_admin', $is_exclude_admin);

        add_action('wp_head', fn () => $this->print_windpress_metadata(), 1_000_001);

        if ($is_cache_enabled && $this->is_cache_exists() && ! $is_exclude_admin) {
            add_action('wp_head', fn () => $this->enqueue_css_cache(), 1_000_001);
        } else {
            add_action('wp_head', fn () => $this->enqueue_play_cdn(), 1_000_001);
        }

        if ($this->is_ubiquitous_panel()) {
            add_action('wp_head', fn () => $this->enqueue_front_panel(), 1_000_001);
        }
    }

    public function is_cache_exists()
    {
        return file_exists(Cache::get_cache_path(Cache::CSS_CACHE_FILE)) && is_readable(Cache::get_cache_path(Cache::CSS_CACHE_FILE));
    }

    public function enqueue_css_cache()
    {
        if (! $this->is_cache_exists()) {
            return;
        }

        do_action('a!windpress/core/runtime:enqueue_css_cache.before');

        $handle = WIND_PRESS::WP_OPTION . '-cached';

        if (Config::get('performance.cache.inline_load', false)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file
            $css_clean = file_get_contents(Cache::get_cache_path(Cache::CSS_CACHE_FILE));

            if ($css_clean === false) {
                return;
            }

            wp_register_style($handle, false, [], false);
            wp_add_inline_style($handle, wp_strip_all_tags($css_clean));
            wp_print_styles($handle);
        } else {
            $version = (string) filemtime(Cache::get_cache_path(Cache::CSS_CACHE_FILE));
            wp_register_style($handle, Cache::get_cache_url(Cache::CSS_CACHE_FILE), [], $version);
            wp_print_styles($handle);
        }

        do_action('a!windpress/core/runtime:enqueue_css_cache.after', $handle);
    }

    public function getVFSHtml()
    {
        $volumeEntries = array_reduce(Volume::get_entries(), fn ($carry, $entry) => $carry + [
            '/' . $entry['relative_path'] => $entry['content'],
        ], []);

        // Script content are base64 encoded to prevent it from being executed by the browser.
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        return sprintf('<script id="windpress:vfs" type="text/plain">%s</script>', base64_encode(wp_json_encode($volumeEntries)));
    }

    public function enqueue_play_cdn($display = true)
    {
        // Script content are base64 encoded to prevent it from being executed by the browser.
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo $this->getVFSHtml();

        do_action('a!windpress/core/runtime:enqueue_play_cdn.before');

        $can_load_modules = current_user_can('manage_options');

        $this->enqueue_play_modules($can_load_modules);

        wp_enqueue_script(WIND_PRESS::WP_OPTION . ':observer');

        do_action('a!windpress/core/runtime:enqueue_play_cdn.after');
    }

    public function enqueue_play_modules($can_load_modules)
    {
        // Register the modules
        $loaded_modules = [];
        if ($can_load_modules) {
            AssetVite::get_instance()->register_asset('assets/packages/core/tailwindcss/play/autocomplete.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':autocomplete',
                'in-footer' => true,
            ]);
            $loaded_modules[] = WIND_PRESS::WP_OPTION . ':autocomplete';

            AssetVite::get_instance()->register_asset('assets/packages/core/tailwindcss/play/sort.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':sort',
                'in-footer' => true,
            ]);
            $loaded_modules[] = WIND_PRESS::WP_OPTION . ':sort';

            AssetVite::get_instance()->register_asset('assets/packages/core/tailwindcss/play/classname-to-css.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':classname-to-css',
                'in-footer' => true,
            ]);
            $loaded_modules[] = WIND_PRESS::WP_OPTION . ':classname-to-css';
        }

        AssetVite::get_instance()->register_asset('assets/packages/core/tailwindcss/play/observer.js', [
            'handle' => WIND_PRESS::WP_OPTION . ':observer',
            'in-footer' => true,
            'dependencies' => array_merge(['wp-i18n', 'wp-hooks'], is_array($loaded_modules) ? $loaded_modules : iterator_to_array($loaded_modules)),
        ]);
    }

    public function enqueue_front_panel()
    {
        $handle = WIND_PRESS::WP_OPTION . ':admin';

        AssetVite::get_instance()->enqueue_asset('assets/dashboard/main.js', [
            'handle' => $handle,
            'in_footer' => true,
            'dependencies' => ['wp-i18n', 'wp-hooks'],
        ]);

        wp_set_script_translations($handle, 'windpress');

        // do enqueue scripts manually as it already runned before
        wp_enqueue_scripts();
    }

    public function is_ubiquitous_panel()
    {
        return Config::get('general.ubiquitous-panel.enabled', false)
            && current_user_can('manage_options')
            && ! apply_filters('f!windpress/core/runtime:append_header.ubiquitous_panel.is_prevent_load', false);
    }

    public function print_windpress_metadata()
    {
        $metadata = $this->assets_metadata();

        $metadata = apply_filters('f!windpress/core/runtime:print_windpress_metadata', $metadata);

        /**
         * @see \WP_Scripts::localize()
         */
        foreach ($metadata as $key => $value) {
            if (! is_scalar($value)) {
                continue;
            }

            $metadata[$key] = html_entity_decode((string) $value, ENT_QUOTES, 'UTF-8');
        }

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo sprintf('<script id="windpress:metadata">var windpress = %s;</script>', wp_json_encode($metadata));
    }

    public function assets_metadata()
    {
        $metadata = [
            '_version' => WIND_PRESS::VERSION,
            '_wp_version' => get_bloginfo('version'),
            '_via_wp_org' => ! Common::is_updater_library_available(),
            'is_ubiquitous' => $this->is_ubiquitous_panel(),
            'assets' => [
                'url' => AssetVite::asset_base_url(),
            ],
            'user_data' => [
                'data_dir' => [
                    // 'path' => Volume::data_dir_path(),
                    'url' => Volume::data_dir_url(),
                ],
                'cache_dir' => [
                    // 'path' => Cache::cache_dir_path(),
                    // 'url' => Cache::cache_dir_url(),
                ],
            ],
        ];

        if (current_user_can('manage_options')) {
            $metadata['_wpnonce'] = wp_create_nonce(WIND_PRESS::WP_OPTION);

            $metadata['rest_api'] = [
                'nonce' => wp_create_nonce('wp_rest'),
                'root' => esc_url_raw(rest_url()),
                'namespace' => WIND_PRESS::REST_NAMESPACE,
                'url' => esc_url_raw(rest_url(WIND_PRESS::REST_NAMESPACE)),
            ];

            $metadata['site_meta'] = [
                'name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
            ];
        }

        return $metadata;
    }
}
