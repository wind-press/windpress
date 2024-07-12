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
use WindPress\WindPress\Utils\Config;

/**
 * @since 1.0.0
 * 
 * TODO: This class is not yet implemented, it's just temporary for Universal Editor testing purpose.
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
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function init()
    {
        if (!is_admin()) {
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

        if ($is_cache_enabled && $this->is_cache_exists() && !$is_exclude_admin) {
            add_action('wp_head', fn () => $this->enqueue_css_cache(), 1_000_001);
        } else {
            add_action('wp_head', fn () => $this->enqueue_play_cdn(), 1_000_001);

            if (
                Config::get('general.mission-control.front.enabled', false)
                && current_user_can('manage_options')
                && !apply_filters('f!windpress/core/runtime:append_header.mission_control.is_prevent_load', false)
            ) {
                add_action('wp_head', fn () => $this->enqueue_front_panel(), 1_000_001);
            }
        }
    }

    public function is_cache_exists()
    {
        return file_exists(Cache::get_cache_path(Cache::CSS_CACHE_FILE)) && is_readable(Cache::get_cache_path(Cache::CSS_CACHE_FILE));
    }

    public function enqueue_css_cache()
    {
        if (!$this->is_cache_exists()) {
            return;
        }

        $handle = WIND_PRESS::WP_OPTION . '-cached';

        if (Config::get('performance.cache.inline_load', false)) {
            $css = file_get_contents(Cache::get_cache_path(Cache::CSS_CACHE_FILE));

            if ($css === false) {
                return;
            }

            // CSS content are processed by lightningcss library and it's safe to be printed directly.
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo sprintf("<style id=\"%s-css\">\n%s\n</style>", $handle, strip_tags($css));
        } else {
            $version = (string) filemtime(Cache::get_cache_path(Cache::CSS_CACHE_FILE));
            wp_register_style($handle, Cache::get_cache_url(Cache::CSS_CACHE_FILE), [], $version);
            wp_print_styles($handle);
        }
    }


    public function enqueue_play_cdn($display = true)
    {
        // add main.css
        $stub_main_css = file_get_contents(dirname(WIND_PRESS::FILE) . '/stubs/main.css');
        $main_css = $stub_main_css;
        $main_css_path = wp_upload_dir()['basedir'] . WIND_PRESS::DATA_DIR . 'main.css';
        if (file_exists($main_css_path)) {
            $main_css = file_get_contents($main_css_path);
        }

        // Script content are base64 encoded to prevent it from being executed by the browser.
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo sprintf("<script type=\"text/tailwindcss\">%s</script>", base64_encode($main_css));

        AssetVite::get_instance()->enqueue_asset('assets/packages/core/tailwind/autocomplete.js', [
            'handle' => WIND_PRESS::WP_OPTION . ':autocomplete',
            'in-footer' => true,
        ]);

        AssetVite::get_instance()->enqueue_asset('assets/packages/core/tailwind/sort.js', [
            'handle' => WIND_PRESS::WP_OPTION . ':sort',
            'in-footer' => true,
        ]);

        AssetVite::get_instance()->enqueue_asset('assets/packages/core/tailwind/observer.js', [
            'handle' => WIND_PRESS::WP_OPTION . ':observer',
            'in-footer' => true,
        ]);
    }

    public function enqueue_front_panel()
    {
        $handle = WIND_PRESS::WP_OPTION . ':admin';

        AssetVite::get_instance()->enqueue_asset('assets/apps/dashboard/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_set_script_translations($handle, 'windpress');

        wp_localize_script($handle, 'windpress', [
            '_version' => WIND_PRESS::VERSION,
            '_wpnonce' => wp_create_nonce(WIND_PRESS::WP_OPTION),
            'rest_api' => [
                'nonce' => wp_create_nonce('wp_rest'),
                'root' => esc_url_raw(rest_url()),
                'namespace' => WIND_PRESS::REST_NAMESPACE,
                'url' => esc_url_raw(rest_url(WIND_PRESS::REST_NAMESPACE)),
            ],
            'assets' => [
                'url' => AssetVite::asset_base_url(),
            ],
            'site_meta' => [
                'name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
            ],
            'is_universal' => true,
        ]);

        // do enqueue scripts manually as it already runned before
        wp_enqueue_scripts();
    }
}
