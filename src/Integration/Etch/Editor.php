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

namespace WindPress\WindPress\Integration\Etch;

use WIND_PRESS;
use WindPress\WindPress\Admin\AdminPage;
use WindPress\WindPress\Utils\AssetVite;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Editor
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', fn () => $this->editor_assets(), 1_000_001);
    }

    public function editor_assets()
    {
        if (! (isset($_GET['etch']) && $_GET['etch'] === 'magic')) {
            return;
        }

        $handle = WIND_PRESS::WP_OPTION . ':integration-etch-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/etch/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_register_script($handle, false);
        wp_enqueue_script($handle);

        wp_localize_script($handle, 'windpressetch', [
            '_version' => WIND_PRESS::VERSION,
            'assets' => [
                'url' => AssetVite::asset_base_url(),
            ],
            'site_meta' => [
                'name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
                'admin_url' => AdminPage::get_page_url(),
            ],
        ]);

        wp_add_inline_script($handle, <<<JS
            // add __windpress__disablePlayObserver to window if not exists
            if (typeof window.__windpress__disablePlayObserver === 'undefined') {
                window.__windpress__disablePlayObserver = true;
            }
        JS, 'after');
    }
}
