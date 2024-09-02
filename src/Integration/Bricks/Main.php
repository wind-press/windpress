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

use WindPress\WindPress\Integration\IntegrationInterface;
use WindPress\WindPress\Utils\Config;

/**
 * Tested with Bricks version 1.10.3
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Main implements IntegrationInterface
{
    public function __construct()
    {
        add_filter('f!windpress/core/cache:compile.providers', fn (array $providers): array => $this->register_provider($providers));

        if ($this->is_enabled()) {
            add_filter('f!windpress/core/runtime:is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            add_filter('f!windpress/core/runtime:append_header.mission_control.is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            add_filter('f!windpress/core/runtime:append_header.exclude_admin', fn (bool $is_exclude_admin): bool => $this->is_exclude_admin($is_exclude_admin));
            new Editor();
        }
    }

    public function get_name(): string
    {
        return 'bricks';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/bricks:enabled',
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
            'name' => 'Bricks Builder',
            'description' => 'Bricks Builder integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }

    public function is_prevent_load(bool $is_prevent_load): bool
    {
        if ($is_prevent_load || !function_exists('bricks_is_builder_main')) {
            return $is_prevent_load;
        }

        return bricks_is_builder_main();
    }

    public function is_exclude_admin(bool $is_exclude_admin): bool
    {
        if ($is_exclude_admin || !function_exists('bricks_is_builder_iframe')) {
            return $is_exclude_admin;
        }

        return bricks_is_builder_iframe();
    }
}
