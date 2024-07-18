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

namespace WindPress\WindPress\Integration\Builderius;

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
            add_filter('f!windpress/core/runtime:is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            add_filter('f!windpress/core/runtime:append_header.mission_control.is_prevent_load', fn (bool $is_prevent_load): bool => $this->is_prevent_load($is_prevent_load));
            add_filter('f!windpress/core/runtime:append_header.exclude_admin', fn (bool $is_exclude_admin): bool => $this->is_exclude_admin($is_exclude_admin));
            new Editor();
        }
    }

    public function get_name(): string
    {
        return 'builderius';
    }

    public function is_enabled(): bool
    {
        return (bool) apply_filters(
            'f!windpress/integration/builderius:enabled',
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
            'name' => 'Builderius',
            'description' => 'Builderius integration',
            'callback' => Compile::class,
            'enabled' => $this->is_enabled(),
        ];

        return $providers;
    }

    public function is_prevent_load(bool $is_prevent_load): bool
    {
        if ($is_prevent_load || !$this->is_editor()) {
            return $is_prevent_load;
        }

        return $this->is_editor();
    }

    public function is_exclude_admin(bool $is_exclude_admin): bool
    {
        if ($is_exclude_admin || !$this->is_preview()) {
            return $is_exclude_admin;
        }

        return $this->is_preview();
    }

    public function is_preview(): bool
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['builderius_inner_preview']) && $_GET['builderius_inner_preview'];
    }

    public function is_editor(): bool
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is not a form submission
        return isset($_GET['builderius_template']) && $_GET['builderius_template'] && isset($_GET['builderius']);
    }
}
