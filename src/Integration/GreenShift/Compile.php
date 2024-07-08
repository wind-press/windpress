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
    /**
     * @param array $post_types
     */
    public function __invoke($post_types): array
    {
        if (!defined('GREENSHIFT_DIR_PATH')) {
            return $post_types;
        }

        $post_types[] = 'wp_block';

        return $post_types;
    }
}