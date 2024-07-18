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

namespace WindPress\WindPress\Integration\Breakdance;

use WindPress\WindPress\Integration\IntegrationInterface;
use WindPress\WindPress\Utils\Config;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Main implements IntegrationInterface
{
    public function __construct()
    {
        add_filter('f!windpress/core/cache:compile.providers', fn (array $providers): array => $this->register_provider($providers));

        if ($this->is_enabled()) {
            // add_filter('f!windpress/core/runtime:is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            // add_filter('f!windpress/core/runtime:append_header.exclude_admin', fn (bool $is_exclude_admin): bool => $this->is_exclude_admin($is_exclude_admin));
            // add_action('a!yabe/movebender/module/plainclasses:register_autocomplete', fn () => $this->register_movebender_autocomplete());
            new Editor();
        }
    }

    public function get_name(): string
    {
        return 'breakdance';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/breakdance:enabled',
            Config::get(sprintf(
                'integration.%s.enabled',
                $this->get_name()
            ), true)
        );
    }

    public function register_provider(array $providers): array
    {
        $providers[] = [
            'id' => $this->get_name(),
            'name' => 'Breakdance Builder',
            'description' => 'Breakdance Builder integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }

    public function is_prevent_load(bool $is_prevent_load): bool
    {
        if ($is_prevent_load) {
            return $is_prevent_load;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['breakdance']) && $_GET['breakdance'] === 'builder';
    }

    public function is_exclude_admin(bool $is_exclude_admin): bool
    {
        if ($is_exclude_admin) {
            return $is_exclude_admin;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['breakdance_iframe']) && $_GET['breakdance_iframe'] === 'true';
    }

    public function register_movebender_autocomplete()
    {
        echo <<<HTML
            <script>
                document.addEventListener('DOMContentLoaded', async function () {
                    while (!document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas')) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    const iframeWindow = document.querySelector('#app #iframe');

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

                    wp.hooks.addFilter('movebender-autocomplete-items-query', 'movebender', async (autocompleteItems, text) => {
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
            </script>
        HTML;
    }
}
