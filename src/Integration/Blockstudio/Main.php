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

use WindPress\WindPress\Integration\IntegrationInterface;
use WindPress\WindPress\Utils\Config;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Main implements IntegrationInterface
{
    public function __construct()
    {
        add_filter('f!windpress/core/cache:compile.providers', fn (array $providers): array => $this->register_provider($providers));

        if ($this->is_enabled()) {
            new Editor();
        }
    }

    public function get_name(): string
    {
        return 'blockstudio';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/blockstudio:enabled',
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
            'name' => __('Blockstudio', 'windpress'),
            'description' => __('Blockstudio integration', 'windpress'),
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }
}
