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
        add_action('lc_editor_before_body_closing', fn () => $this->register_livecanvas_autocomplete());
    }

    public function register_livecanvas_autocomplete()
    {
        $handle = WIND_PRESS::WP_OPTION . ':integration-livecanvas-editor';

        AssetVite::get_instance()->enqueue_asset('assets/integration/livecanvas/main.js', [
            'handle' => $handle,
            'in_footer' => true,
        ]);

        wp_localize_script($handle, 'windpresslivecanvas', [
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
