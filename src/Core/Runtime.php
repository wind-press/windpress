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
            // $is_prevent_load = apply_filters('f!windpress/core/runtime:is_prevent_load', false);

            // if ($is_prevent_load) {
            //     return;
            // }

            $this->append_header();
        }
    }

    public function append_header()
    {
        // add_action('wp_head', fn () => $this->enqueue_universal_mission_control(), 1_000_001);
        add_action('wp_head', fn () => $this->enqueue_universal_mission_control(), 1_000_001);
    }

    public function enqueue_universal_mission_control()
    {
        error_log('enqueue_universal_mission_control');

        // Ensure that the Universal Mission Control is only loaded by Admin role and in the front-end
        $handle = WIND_PRESS::WP_OPTION . ':admin';

        AssetVite::get_instance()->enqueue_asset('assets/admin/main.js', [
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
