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

namespace WindPress\WindPress\Integration\Blockstudio;

use WindPress\WindPress\Core\Runtime;
use WindPress\WindPress\Integration\IntegrationInterface;
use WindPress\WindPress\Utils\Config;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Main implements IntegrationInterface
{
    public function __construct()
    {
        return;
        add_filter('f!windpress/core/cache:compile.providers', fn (array $providers): array => $this->register_provider($providers));

        if ($this->is_enabled()) {
            // add_action('admin_head', fn () => $this->admin_head());
        }
    }

    public function get_name(): string
    {
        return 'blockstudio';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/blockstudio:enabled',
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
            'name' => 'Blockstudio',
            'description' => 'Blockstudio integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }

    public function admin_head()
    {
        $screen = get_current_screen();

        if (is_admin() && $screen->id === 'toplevel_page_blockstudio') {
            $this->append_editor_markup();
        }
    }

    /**
     * @see https://blockstudio.dev/documentation/hooks/php/#editor-markup
     */
    public function append_editor_markup()
    {
        $markup = base64_encode(Runtime::get_instance()->enqueue_importmap(false) . Runtime::get_instance()->enqueue_play_cdn(false));

        echo <<<HTML
            <script>
                (async () => {
                    while(!window.blockstudioEditorMarkup && typeof window.blockstudioEditorMarkup !== 'string') {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    window.blockstudioEditorMarkup += atob('{$markup}');
                })();
            </script>
        HTML;
    }
}
