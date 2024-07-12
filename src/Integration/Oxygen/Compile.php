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

use WP_Query;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    private array $ignored_post_types = [
        'attachment',
        'revision',
        'nav_menu_item',
        'custom_css',
        'customize_changeset',
        'oembed_cache',
    ];

    private array $post_meta_keys = [
        'ct_builder_shortcodes',
        'ct_builder_json',
    ];

    public function __invoke(): array
    {
        if (! defined('CT_PLUGIN_MAIN_FILE')) {
            return [];
        }

        return $this->get_contents();
    }

    public function get_contents(): array
    {
        $contents = [];

        $post_types = array_filter(
            get_post_types(),
            fn ($post_type) => ! in_array($post_type, apply_filters('f!windpress/integration/oxygen/compile:get_contents.ignored_post_types', $this->ignored_post_types))
                && get_option('oxygen_vsb_ignore_post_type_' . $post_type) !== 'true'
        );

        $wpQuery = new WP_Query([
            'posts_per_page' => -1,
            'fields' => 'ids',
            'post_type' => $post_types,
            'meta_query' => [
                'relation' => 'OR',
                ...array_map(
                    static fn ($meta_key) => [
                        'key' => $meta_key,
                        'compare' => '!=',
                        'value' => '',
                    ],
                    apply_filters('f!windpress/integration/oxygen/compile:get_contents.post_meta_keys', $this->post_meta_keys)
                ),
            ],
        ]);

        foreach ($wpQuery->posts as $post_id) {
            $contents = [...$contents, ...$this->get_post_metas($post_id)];
        }

        return $contents;
    }

    public function get_post_metas($post_id): array
    {
        $shortcode = get_post_meta($post_id, 'ct_builder_json', true);
        if ($shortcode) {
            return [
                [
                    'content' => json_decode($shortcode, true),
                ],
            ];
        }

        $shortcode = get_post_meta($post_id, 'ct_builder_shortcodes', true);

        if (! is_array($shortcode)) {
            $shortcode = json_decode(oxygen_safe_convert_old_shortcodes_to_json($shortcode), true);
        }

        if (! is_array($shortcode)) {
            return [];
        }

        return [
            [
                'content' => $shortcode,
            ],
        ];
    }
}
