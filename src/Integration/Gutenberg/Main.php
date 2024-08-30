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
use WindPress\WindPress\Integration\IntegrationInterface;
use WindPress\WindPress\Utils\AssetVite;
use WindPress\WindPress\Utils\Config;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Main implements IntegrationInterface
{
    public function __construct()
    {
        add_filter('f!windpress/core/cache:compile.providers', fn(array $providers): array => $this->register_provider($providers));

        if ($this->is_enabled()) {
            add_action('enqueue_block_editor_assets', fn() => $this->enqueue_block_editor_assets());
        }
    }

    public function get_name(): string
    {
        return 'gutenberg';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/gutenberg:enabled',
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
            'name' => 'Gutenberg',
            'description' => 'Gutenberg integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }

    public function enqueue_block_editor_assets()
    {
        $screen = get_current_screen();
        if (is_admin() && $screen->is_block_editor()) {
            add_action('admin_head', fn() => $this->admin_head(), 1_000_001);
        }
    }

    public function admin_head()
    {
        Runtime::get_instance()->enqueue_play_cdn();

        if (strpos($_SERVER['REQUEST_URI'], 'site-editor.php') !== false) {
            // wp_enqueue_script(WIND_PRESS::WP_OPTION . '-gutenberg-fse', plugin_dir_url(WIND_PRESS::FILE) . 'build/public/gutenberg/fse.js', [], WIND_PRESS::VERSION, true);
        } else {
            // deprecated
            // wp_enqueue_script(WIND_PRESS::WP_OPTION . '-gutenberg-observer', plugin_dir_url(WIND_PRESS::FILE) . 'build/public/gutenberg/observer.js', [], WIND_PRESS::VERSION, true);


            // handle the canvas side
            AssetVite::get_instance()->enqueue_asset('assets/integration/gutenberg/post-editor.js', [
                'handle' => WIND_PRESS::WP_OPTION . ':integration-gutenberg-post-editor',
                'in-footer' => true,
            ]);

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
}
