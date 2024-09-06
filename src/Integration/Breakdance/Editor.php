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
        /**
         * @see wp-content/plugins/breakdance/plugin/loader/loader.php#L74
         */
        add_action('unofficial_i_am_kevin_geary_master_of_all_things_css_and_html', fn () => $this->editor_assets(), 1_000_001);
    }

    public function editor_assets()
    {
        if (! (isset($_GET['breakdance']) && $_GET['breakdance'] === 'builder')) {
            return;
        }

        $handle = WIND_PRESS::WP_OPTION . ':integration-breakdance-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/breakdance/main.js', [
            'handle' => $handle,
            'in_footer' => true,
            'dependencies' => ['wp-hooks'],
        ]);

        wp_localize_script($handle, 'windpressbreakdance', [
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
            document.addEventListener('DOMContentLoaded', async function () {
                while (!document.getElementById('iframe')?.contentDocument.querySelector('#breakdance_canvas')) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                let iframeWindow = document.getElementById('iframe');

                wp.hooks.addFilter('windpressbreakdance-autocomplete-items-query', 'windpressbreakdance', async (autocompleteItems, text) => {
                    if (!iframeWindow.contentWindow.windpress?.loaded?.module?.autocomplete) {
                        return autocompleteItems;
                    }

                    const windpress_suggestions = iframeWindow.contentWindow.wp.hooks.applyFilters('windpress.module.autocomplete', text);

                    return [...windpress_suggestions, ...autocompleteItems];
                });
            });
        JS, 'after');

        $this->recursive_wp_scripts_render($handle);
    }

    public function recursive_wp_scripts_render($handle)
    {
        $wp_scripts = wp_scripts()->registered[$handle];

        if (isset($wp_scripts->deps)) {
            foreach ($wp_scripts->deps as $dep) {
                $this->recursive_wp_scripts_render($dep);
            }
        }

        if (isset($wp_scripts->extra['data'])) {
            echo sprintf('<script type="text/javascript" id="%s-js-extra">%s</script>', $wp_scripts->handle, $wp_scripts->extra['data']);
        }

        echo sprintf('<script type="module" id="%s-js" src="%s"></script>', $wp_scripts->handle, $wp_scripts->src);

        if (isset($wp_scripts->extra['after'])) {
            foreach ($wp_scripts->extra['after'] as $after) {
                echo sprintf('<script type="text/javascript" id="%s-js-after">%s</script>', $wp_scripts->handle, $after);
            }
        }
    }
}
