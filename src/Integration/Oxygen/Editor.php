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

namespace WindPress\WindPress\Integration\Oxygen;

use SIUL;
use WindPress\WindPress\Utils\AssetVite;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Editor
{
    public function __construct()
    {
        add_action('oxygen_enqueue_iframe_scripts', fn () => $this->iframe_assets(), 1_000_000);
        add_action('oxygen_enqueue_ui_scripts', fn () => $this->editor_assets(), 1_000_000);
    }

    public function iframe_assets()
    {
        $handle = SIUL::WP_OPTION . ':siuloxygen-iframe';

        AssetVite::get_instance()->enqueue_asset('assets/integration/oxygen/iframe/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);
    }

    public function editor_assets()
    {
        $handle = SIUL::WP_OPTION . ':siuloxygen-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/oxygen/editor/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_localize_script($handle, 'siuloxygen', [
            '_version' => SIUL::VERSION,
            '_wpnonce' => wp_create_nonce(SIUL::WP_OPTION),
            'rest_api' => [
                'nonce' => wp_create_nonce('wp_rest'),
                'root' => esc_url_raw(rest_url()),
                'namespace' => SIUL::REST_NAMESPACE,
                'url' => esc_url_raw(rest_url(SIUL::REST_NAMESPACE)),
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
                const iframeWindow = document.getElementById('ct-artificial-viewport');

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

                wp.hooks.addFilter('siuloxygen-autocomplete-items-query', 'siuloxygen', async (autocompleteItems, text) => {
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
