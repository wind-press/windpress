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

namespace WindPress\WindPress\Integration\Kadence;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * TODO: Don't depend on the Gutenberg's Compile class. Instead, reduplicate the code here.
 */
class Compile
{
    public function __invoke()
    {
        return [];
        if (!defined('KADENCE_VERSION')) {
            return;
        }

        add_filter('f!windpress/integration/gutenberg/compile:get_contents.post_types', fn (array $post_types): array => $this->get_post_types($post_types));
        add_filter('f!windpress/integration/gutenberg/compile:get_contents.render', function ($should_render, \WP_Post $post): bool {
            return $post->post_type !== 'kadence_form' && $post->post_type !== 'kadence_element';
        }, 10, 2);
    }

    /**
     * @param array $post_types
     */
    public function get_post_types($post_types): array
    {
        $post_types[] = 'kadence_form';
        $post_types[] = 'kadence_element';

        return $post_types;
    }
}
