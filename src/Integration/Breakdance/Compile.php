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

use WP_Query;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    private array $post_meta_keys = [
        'breakdance_data',
        '_breakdance_data',
    ];

    public function __invoke(): array
    {
        if (! defined('__BREAKDANCE_VERSION') || (defined('BREAKDANCE_MODE') && BREAKDANCE_MODE !== 'breakdance')) {
            return [];
        }

        return $this->get_contents();
    }

    public function get_contents(): array
    {
        $contents = [];

        $post_types = apply_filters('f!windpress/integration/breakdance/compile:get_contents.post_types', \Breakdance\Settings\get_allowed_post_types());

        $wpQuery = new WP_Query([
            'posts_per_page' => -1,
            'fields' => 'ids',
            'post_type' => $post_types,
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- This only run by trigger on specific event
            'meta_query' => array_merge([
                'relation' => 'OR',
            ], array_map(static fn ($key) => [
                'key' => $key,
            ], $this->post_meta_keys)),
        ]);

        foreach ($wpQuery->posts as $post_id) {
            $contents = [...$contents, ...$this->get_post_metas($post_id)];
        }

        return $contents;
    }

    public function get_post_metas($post_id): array
    {
        $contents = [];

        $html = \Breakdance\Data\get_tree_as_html($post_id);

        if ($html) {
            $contents[] = [
                'content' => $html,
                'name' => $post_id,
            ];
        }

        return $contents;
    }
}
