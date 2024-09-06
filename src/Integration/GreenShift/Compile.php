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

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    public function __invoke()
    {
        if (! defined('GREENSHIFT_DIR_PATH')) {
            return;
        }

        add_filter('f!windpress/integration/gutenberg/compile:get_contents.post_types', fn (array $post_types): array => $this->get_post_types($post_types));
    }

    /**
     * @param array $post_types
     */
    public function get_post_types($post_types): array
    {
        $post_types[] = 'wp_block';

        return $post_types;
    }
}
