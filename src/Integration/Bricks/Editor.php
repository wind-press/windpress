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

namespace WindPress\WindPress\Integration\Bricks;

use WIND_PRESS;
use WindPress\WindPress\Utils\AssetVite;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Editor
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', fn () => $this->editor_assets(), 1_000_000);
    }

    public function editor_assets()
    {
        if (!function_exists('bricks_is_builder_main') || !\bricks_is_builder_main()) {
            return;
        }

        $handle = WIND_PRESS::WP_OPTION . ':integration-bricks-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/bricks/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_localize_script($handle, 'windpressbricks', [
            '_version' => WIND_PRESS::VERSION,
            'assets' => [
                'url' => AssetVite::asset_base_url(),
            ],
            'site_meta' => [
                'name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
            ],
        ]);

        wp_add_inline_script($handle, <<<JS
            document.addEventListener('DOMContentLoaded', function () {
                const iframeWindow = document.getElementById('bricks-builder-iframe');

                wp.hooks.addFilter('windpressbricks-autocomplete-items-query', 'windpressbricks', async (autocompleteItems, text) => {
                    if (!iframeWindow.contentWindow.windpress?.loaded?.module?.autocomplete) {
                        return autocompleteItems;
                    }
                    
                    const windpress_suggestions = iframeWindow.contentWindow.wp.hooks.applyFilters('windpress.module.autocomplete', text);

                    return [...windpress_suggestions, ...autocompleteItems];
                });
            });
        JS, 'after');
    }
}
