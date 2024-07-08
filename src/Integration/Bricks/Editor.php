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

        $handle = WIND_PRESS::WP_OPTION . ':siulbricks-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/bricks/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_localize_script($handle, 'siulbricks', [
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

        wp_add_inline_script($handle, <<<JS
            document.addEventListener('DOMContentLoaded', function () {
                const iframeWindow = document.getElementById('bricks-builder-iframe');

                // Cached query for autocomplete items.
                const cached_query = new Map();
                async function searchQuery(query) {
                    // split query by `:` and search for each subquery
                    let prefix = query.split(':');
                    let q = prefix.pop();
                    for (let i = query.length; i > query.length - q.length; i--) {
                        const subquery = query.slice(0, i);
                        if (cached_query.has(subquery)) {
                            return cached_query.get(subquery);
                        }
                    }

                    const suggestions = await iframeWindow.contentWindow.wp.hooks.applyFilters('siul.module.autocomplete', query)
                        .then((suggestions) => {
                            return suggestions.map((s) => {
                                return {
                                    value: [...s.variants, s.name].join(':'),
                                    color: s.color,
                                };
                            });
                        });

                    cached_query.set(query, suggestions);

                    return suggestions;
                }

                wp.hooks.addFilter('siulbricks-autocomplete-items-query', 'siulbricks', async (autocompleteItems, text) => {
                    if (!iframeWindow.contentWindow.siul?.loaded?.module?.autocomplete) {
                        return autocompleteItems;
                    }

                    const siul_suggestions = await searchQuery(text);

                    return [...siul_suggestions, ...autocompleteItems];
                });

                // clear cache each 1 minute to avoid memory leak
                setInterval(() => {
                    cached_query.clear();
                }, 60000);
            });
        JS, 'after');
    }
}
