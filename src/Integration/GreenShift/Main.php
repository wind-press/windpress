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
            add_filter('f!windpress/integration/gutenberg/compile:get_contents.post_types', fn (array $post_types): array => (new Compile())($post_types));
        }
    }

    public function get_name(): string
    {
        return 'greenshift';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/greenshift:enabled',
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
            'name' => 'GreenShift',
            'description' => 'GreenShift integration',
            'callback' => fn () => [],
            'enabled' => $this->is_enabled(),
            'meta' => [
                'experimental' => true,
            ]
        ];

        return $providers;
    }
}