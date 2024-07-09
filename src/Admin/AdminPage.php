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

namespace WindPress\WindPress\Admin;

use WIND_PRESS;
use WindPress\WindPress\Utils\AssetVite;

class AdminPage
{
    public function __construct()
    {
        add_action('admin_menu', fn () => $this->add_admin_menu(), 1_000_001);
    }

    public static function get_page_url(): string
    {
        return add_query_arg([
            'page' => WIND_PRESS::WP_OPTION,
        ], admin_url('admin.php'));
    }

    public function add_admin_menu()
    {
        $hook = add_menu_page(
            __('WindPress', 'windpress'),
            __('WindPress', 'windpress'),
            'manage_options',
            WIND_PRESS::WP_OPTION,
            fn () => $this->render(),
            'data:image/svg+xml;base64,' . base64_encode(file_get_contents(dirname(WIND_PRESS::FILE) . '/windpress.svg')),
            1_000_001
        );

        add_action('load-' . $hook, fn () => $this->init_hooks());
    }

    private function render()
    {
        echo '<div id="windpress-app" class=""></div>';
    }

    private function init_hooks()
    {
        add_action('admin_enqueue_scripts', fn () => $this->enqueue_scripts(), 1_000_001);
    }

    private function enqueue_scripts()
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
        ]);
    }
}
