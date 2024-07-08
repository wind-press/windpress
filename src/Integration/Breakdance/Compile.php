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
    private array $post_meta_keys = [];

    public function __invoke(): array
    {
        if (! defined('__BREAKDANCE_VERSION')) {
            return [];
        }

        $this->post_meta_keys = [
            'breakdance_data'
        ];

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
            'meta_query' => [
                'relation' => 'OR',
                ...array_map(static fn ($key) => [
                    'key' => $key,
                ], $this->post_meta_keys),
            ],
        ]);

        foreach ($wpQuery->posts as $post_id) {
            $contents = [...$contents, ...$this->get_post_metas($post_id)];
        }

        return $contents;
    }

    public function get_post_metas($post_id): array
    {
        $contents = [];

        foreach ($this->post_meta_keys as $post_metum_key) {
            $meta_value = get_post_meta($post_id, $post_metum_key, true);
            if ($meta_value) {
                $contents[] = [
                    'content' => $this->transform_meta_value($meta_value),
                    'name' => $post_id,
                ];
            }
        }

        return $contents;
    }

    /**
     * @param string $meta_value
     * @return string|array
     */
    public function transform_meta_value(string $meta_value)
    {
        try {
            $meta_value = json_decode($meta_value, true);
        } catch (\Exception $e) {
            error_log($e->getMessage());
        }

        return $meta_value;
    }
}
