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

namespace WindPress\WindPress\Integration\LiveCanvas;

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
            add_filter('f!windpress/core/runtime:is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            add_filter('f!windpress/core/runtime:append_header.exclude_admin', fn (bool $is_exclude_admin): bool => $this->is_exclude_admin($is_exclude_admin));
            add_action('lc_editor_before_body_closing', fn () => $this->register_livecanvas_autocomplete());
        }
    }

    public function get_name(): string
    {
        return 'livecanvas';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/livecanvas:enabled',
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
            'name' => 'LiveCanvas',
            'description' => 'LiveCanvas integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
            'meta' => [
                'experimental' => true,
            ]
        ];

        return $providers;
    }

    public function is_prevent_load(bool $is_prevent_load): bool
    {
        if ($is_prevent_load) {
            return $is_prevent_load;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['lc_action_launch_editing']) && $_GET['lc_action_launch_editing'] === '1';
    }

    public function is_exclude_admin(bool $is_exclude_admin): bool
    {
        if ($is_exclude_admin) {
            return $is_exclude_admin;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['lc_page_editing_mode']) && $_GET['lc_page_editing_mode'] === '1';
    }

    public function register_livecanvas_autocomplete()
    {
        echo <<<HTML
            <script>
                document.addEventListener('DOMContentLoaded', async function () {
                    let iframeWindow = document.getElementById('previewiframe');
                    
                    // wait for the iframe to be ready
                    while (
                        (iframeWindow.contentDocument?.body?.innerHTML === '' || iframeWindow.contentDocument?.body?.innerHTML === undefined)
                        || (iframeWindow.contentWindow?.document?.body?.innerHTML === '' || iframeWindow.contentWindow?.document?.body?.innerHTML === undefined)
                    ) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    async function searchQuery(query) {
                        const suggestions = iframeWindow.contentWindow.wp.hooks.applyFilters('windpress.module.autocomplete', query).map((s) => {
                            return {
                                // color: s.color,
                                value: s.value,
                                meta: 'TW 4',
                                caption: s.value,
                                score: 1000, // Custom score for sorting (optional)
                            };
                        });

                        return suggestions;
                    }

                    const langTools = ace.require('ace/ext/language_tools');

                    langTools.addCompleter({
                        getCompletions: function(editor, session, pos, prefix, callback) {
                            let lineTillCursor = session.getDocument().getLine(pos.row).substring(0, pos.column);
                            if (/class=["|'][^"']*$/i.test(lineTillCursor) || /@apply\s+[^;]*$/i.test(lineTillCursor)) {
                                searchQuery(prefix).then((suggestions) => {
                                    callback(null, suggestions);
                                }).catch(error => {
                                    console.error('Error fetching autocomplete suggestions:', error);
                                    callback(error, []);
                                });
                            } else {
                                callback(null, []); // No suggestions if the context is not matched
                            }
                        }
                    });
                });
            </script>
        HTML;
    }
}
