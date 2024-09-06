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

namespace WindPress\WindPress\Integration\Gutenberg;

use WIND_PRESS;
use WindPress\WindPress\Core\Runtime;
use WindPress\WindPress\Utils\AssetVite;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Editor
{
    public function __construct()
    {
        add_action('enqueue_block_editor_assets', fn () => $this->enqueue_block_editor_assets());
    }

    public function enqueue_block_editor_assets()
    {
        $screen = get_current_screen();
        if (is_admin() && $screen->is_block_editor()) {
            add_action('admin_head', fn () => $this->admin_head(), 1_000_001);
        }
    }

    public function admin_head()
    {
        Runtime::get_instance()->enqueue_play_cdn();

        if (strpos($_SERVER['REQUEST_URI'], 'site-editor.php') !== false) {
            // handle the canvas
            AssetVite::get_instance()->enqueue_asset('assets/integration/gutenberg/site-editor.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':integration-gutenberg-site-editor',
                'in-footer' => true,
            ]);
        } else {
            // handle the canvas
            AssetVite::get_instance()->enqueue_asset('assets/integration/gutenberg/post-editor.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':integration-gutenberg-post-editor',
                'in-footer' => true,
            ]);
        }

        $handle = WIND_PRESS::WP_OPTION . ':integration-gutenberg-block-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/gutenberg/block-editor.jsx', [
            'handle' => $handle,
            'in-footer' => true,
            'dependencies' => ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-hooks', 'wp-i18n', 'react', 'react-dom'],
        ]);

        wp_add_inline_script($handle, <<<JS
            document.addEventListener('DOMContentLoaded', function () {
                wp.hooks.addFilter('windpressgutenberg-autocomplete-items-query', 'windpressgutenberg', async (autocompleteItems, text) => {
                    if (!window.windpress?.loaded?.module?.autocomplete) {
                        return autocompleteItems;
                    }

                    const windpress_suggestions = window.wp.hooks.applyFilters('windpress.module.autocomplete', text);

                    return [...windpress_suggestions, ...autocompleteItems];
                });
            });
        JS, 'after');
    }
}
