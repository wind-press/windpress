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

namespace WindPress\WindPress\Integration\GreenShift;

use WP_Query;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    /**
     * @param array $metadata
     */
    public function __invoke($metadata): array
    {
        if (! defined('GREENSHIFT_DIR_PATH')) {
            return [];
        }

        return $this->get_contents($metadata);
    }
    public function get_contents($metadata): array
    {
        $contents = [];
        $post_types = apply_filters('f!windpress/integration/greenshift/compile:get_contents.post_types', [
            'wp_block',
        ]);

        $next_batch = $metadata['next_batch'] !== false ? $metadata['next_batch'] : 1;

        $wpQuery = new WP_Query([
            'posts_per_page' => apply_filters('f!windpress/integration/greenshift/compile:get_contents.post_per_page', (int) get_option('posts_per_page', 10)),
            'post_type' => $post_types,
            'paged' => $next_batch,
        ]);

        foreach ($wpQuery->posts as $post) {
            if (trim($post->post_content) === '' || trim($post->post_content) === '0') {
                continue;
            }

            $post_content = $post->post_content;

            if (apply_filters('f!windpress/integration/greenshift/compile:get_contents.render', true, $post)) {
                $fn_renders = apply_filters('f!windpress/integration/greenshift/compile:get_contents.render_fn', [
                    'do_blocks',
                    'wptexturize',
                    'convert_smilies',
                    'shortcode_unautop',
                    'wp_filter_content_tags',
                    'do_shortcode',
                ], $post);

                foreach ($fn_renders as $fn_render) {
                    try {
                        $post_content = $fn_render($post_content);
                    } catch (\Throwable $th) {
                        if (WP_DEBUG) {
                            error_log($th->getMessage());
                        }
                    }
                }
            }

            $post_content = apply_filters('f!windpress/integration/greenshift/compile:get_contents.post_content', $post_content, $post);

            $contents[] = [
                'id' => $post->ID,
                'title' => sprintf('#%s: %s', $post->ID, $post->post_title),
                'content' => $post_content,
            ];
        }

        return [
            'metadata' => [
                'next_batch' => $wpQuery->max_num_pages > $next_batch ? $next_batch + 1 : false,
                'total_batches' => $wpQuery->max_num_pages,
            ],
            'contents' => $contents,
        ];
    }
}
