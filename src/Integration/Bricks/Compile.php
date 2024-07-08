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

namespace WindPress\WindPress\Integration\Bricks;

use Bricks\Database;
use WP_Query;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    private array $post_meta_keys = [];

    private array $global_classes_index = [];

    public function __invoke(): array
    {
        if (! defined('BRICKS_VERSION')) {
            return [];
        }

        $this->post_meta_keys = [
            BRICKS_DB_PAGE_HEADER,
            BRICKS_DB_PAGE_CONTENT,
            BRICKS_DB_PAGE_FOOTER,
        ];

        return $this->get_contents();
    }

    public function get_contents(): array
    {
        $contents = [];

        $post_types = Database::$global_settings['postTypes'] ?? [];
        $post_types[] = BRICKS_DB_TEMPLATE_SLUG;

        $post_types = apply_filters('f!windpress/integration/bricks/compile:get_contents.post_types', $post_types);

        foreach (get_option(BRICKS_DB_GLOBAL_CLASSES, []) as $value) {
            $this->global_classes_index[$value['id']] = $value['name'];
        }

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
                    'name' => $post_id,
                    'content' => $this->transform_meta_value($meta_value),
                ];
            }
        }

        return $contents;
    }

    public function transform_meta_value(array $meta_value): array
    {
        foreach ($meta_value as $key => $node) {
            if (array_key_exists('settings', $node)) {
                // swap the global classes with the actual class name
                if (array_key_exists('_cssGlobalClasses', $node['settings'])) {
                    $meta_value[$key]['settings']['_cssGlobalClasses'] = array_map(
                        fn ($class) => array_key_exists($class, $this->global_classes_index)
                            ? $this->global_classes_index[$class]
                            : $class,
                        $node['settings']['_cssGlobalClasses']
                    );
                }

                // if "code" exists and "executeCode" is false, remove the code
                if (array_key_exists('code', $node['settings']) && (! array_key_exists('executeCode', $node['settings']) || $node['settings']['executeCode'] === false)) {
                    unset($meta_value[$key]['settings']['code']);
                }
            }
        }

        return $meta_value;
    }
}
