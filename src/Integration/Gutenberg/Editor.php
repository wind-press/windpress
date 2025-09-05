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

use Exception;
use WIND_PRESS;
use WindPress\WindPress\Core\Runtime;
use WindPress\WindPress\Utils\AssetVite;
use WP_Theme_JSON_Data;
use WindPress\WindPress\Core\Cache as CoreCache;
use WindPress\WindPress\Utils\Config;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Editor
{
    public function __construct()
    {
        add_action('enqueue_block_editor_assets', fn() => $this->enqueue_block_editor_assets());
        if (Config::get('integration.gutenberg.settings.theme_json', true)) {
            add_filter('wp_theme_json_data_user', fn($theme_json) => $this->filter_theme_json_data_user($theme_json), 1_000_001);
        }
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
        Runtime::get_instance()->print_windpress_metadata();
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
            // add __windpress__disable_playObserver to window if not exists
            if (typeof window.__windpress__disable_playObserver === 'undefined') {
                window.__windpress__disable_playObserver = true;
            }

            document.addEventListener('DOMContentLoaded', function () {
                wp.hooks.addFilter('windpressgutenberg-autocomplete-items-query', 'windpressgutenberg', async (autocompleteItems, text) => {
                    const windpress_suggestions = await window.windpress.module.autocomplete.query(text);

                    return [...windpress_suggestions, ...autocompleteItems];
                });
            });
        JS, 'after');
    }

    /**
     * @see https://make.wordpress.org/core/2022/10/10/filters-for-theme-json-data/
     * @param WP_Theme_JSON_Data $theme_json
     * @return WP_Theme_JSON_Data
     */
    public function filter_theme_json_data_user($theme_json) {
        // Only apply if Tailwind v4 is active
        if (Runtime::tailwindcss_version() !== 4) {
            return $theme_json;
        }

        $theme_json_cache_path = CoreCache::get_cache_path(CoreCache::THEME_JSON_FILE);
        
        // Check if WindPress theme.json cache exists
        if (!file_exists($theme_json_cache_path)) {
            return $theme_json;
        }

        // Get WindPress theme.json from cache
        $windpress_theme_json_content = file_get_contents($theme_json_cache_path);
        
        if ($windpress_theme_json_content === false) {
            return $theme_json;
        }

        // Decode the cached theme.json
        $windpress_theme_data = json_decode($windpress_theme_json_content, true);
        
        if (!is_array($windpress_theme_data) || !isset($windpress_theme_data['version'])) {
            return $theme_json;
        }

        try {
            // Get current theme.json data
            $current_theme_data = $theme_json->get_data();
            
            // Merge WindPress theme.json with current theme.json
            $merged_data = $this->merge_theme_json_data($current_theme_data, $windpress_theme_data);
            
            // Return updated theme.json data
            return $theme_json->update_with($merged_data);
            
        } catch (Exception $e) {
            if (WP_DEBUG) {
                error_log('WindPress theme.json integration error: ' . $e->getMessage());
            }
            return $theme_json;
        }
    }

    /**
     * Merge WindPress theme.json data with existing theme.json data
     */
    private function merge_theme_json_data(array $current_data, array $windpress_data): array
    {
        // Start with current data
        $merged = $current_data;
        
        // Merge settings
        if (isset($windpress_data['settings'])) {
            // Merge color palette
            if (isset($windpress_data['settings']['color']['palette'])) {
                if (!isset($merged['settings']['color']['palette'])) {
                    $merged['settings']['color']['palette'] = [];
                }
                
                // Add WindPress colors with 'custom' origin to distinguish from theme colors
                foreach ($windpress_data['settings']['color']['palette'] as $color) {
                    $merged['settings']['color']['palette'][] = [
                        'name' => $color['name'],
                        'slug' => 'windpress-' . $color['slug'],
                        'color' => $color['color'],
                    ];
                }
            }
            
            // Merge typography font sizes
            if (isset($windpress_data['settings']['typography']['fontSizes'])) {
                if (!isset($merged['settings']['typography']['fontSizes'])) {
                    $merged['settings']['typography']['fontSizes'] = [];
                }
                
                foreach ($windpress_data['settings']['typography']['fontSizes'] as $fontSize) {
                    $merged['settings']['typography']['fontSizes'][] = [
                        'name' => $fontSize['name'],
                        'slug' => 'windpress-' . $fontSize['slug'],
                        'size' => $fontSize['size'],
                    ];
                }
            }
            
            // Merge typography font families
            if (isset($windpress_data['settings']['typography']['fontFamilies'])) {
                if (!isset($merged['settings']['typography']['fontFamilies'])) {
                    $merged['settings']['typography']['fontFamilies'] = [];
                }
                
                foreach ($windpress_data['settings']['typography']['fontFamilies'] as $fontFamily) {
                    $merged['settings']['typography']['fontFamilies'][] = [
                        'name' => $fontFamily['name'],
                        'slug' => 'windpress-' . $fontFamily['slug'],
                        'fontFamily' => $fontFamily['fontFamily'],
                    ];
                }
            }
            
            // Merge spacing sizes
            if (isset($windpress_data['settings']['spacing']['spacingSizes'])) {
                if (!isset($merged['settings']['spacing']['spacingSizes'])) {
                    $merged['settings']['spacing']['spacingSizes'] = [];
                }
                
                foreach ($windpress_data['settings']['spacing']['spacingSizes'] as $spacing) {
                    $merged['settings']['spacing']['spacingSizes'][] = [
                        'name' => $spacing['name'],
                        'slug' => 'windpress-' . $spacing['slug'],
                        'size' => $spacing['size'],
                    ];
                }
            }
            
            // Merge border radius sizes
            if (isset($windpress_data['settings']['border']['radiusSizes'])) {
                if (!isset($merged['settings']['border']['radiusSizes'])) {
                    $merged['settings']['border']['radiusSizes'] = [];
                }
                
                foreach ($windpress_data['settings']['border']['radiusSizes'] as $radius) {
                    $merged['settings']['border']['radiusSizes'][] = [
                        'name' => $radius['name'],
                        'slug' => 'windpress-' . $radius['slug'],
                        'size' => $radius['size'],
                    ];
                }
            }
            
            // Merge shadow presets
            if (isset($windpress_data['settings']['shadow']['presets'])) {
                if (!isset($merged['settings']['shadow']['presets'])) {
                    $merged['settings']['shadow']['presets'] = [];
                }
                
                foreach ($windpress_data['settings']['shadow']['presets'] as $shadow) {
                    $merged['settings']['shadow']['presets'][] = [
                        'name' => $shadow['name'],
                        'slug' => 'windpress-' . $shadow['slug'],
                        'shadow' => $shadow['shadow'],
                    ];
                }
            }
        }
        
        return $merged;
    }
}
