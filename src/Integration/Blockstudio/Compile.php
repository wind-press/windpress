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

use Blockstudio\Build;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    public function __invoke(): array
    {
        if (! class_exists(Build::class)) {
            return [];
        }

        return $this->get_contents();
    }

    public function get_contents(): array
    {
        $contents = [];

        $build_data = Build::data();

        foreach ($build_data as $block) {
            foreach ($block['filesPaths'] as $path) {
                if (! is_readable($path)) {
                    continue;
                }

                $contents[] = [
                    'name' => $path,
                    'content' => file_get_contents($path),
                    'type' => pathinfo($path, PATHINFO_EXTENSION) === 'json' ? 'json' : null,
                ];
            }
        }

        return $contents;
    }
}
