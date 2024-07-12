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

namespace WindPress\WindPress\Api\Admin\Settings;

use WIND_PRESS;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WindPress\WindPress\Api\AbstractApi;
use WindPress\WindPress\Api\ApiInterface;
use WindPress\WindPress\Core\Cache as CoreCache;
use WindPress\WindPress\Utils\Common;
use WindPress\WindPress\Utils\Debug;

class Cache extends AbstractApi implements ApiInterface
{
    public function __construct()
    {
    }

    public function get_prefix(): string
    {
        return 'admin/settings/cache';
    }

    public function register_custom_endpoints(): void
    {
        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/index',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->index($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/store',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->store($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/providers',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->providers($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/providers/scan',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->providers_scan($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );
    }

    public function index(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $cache_path = CoreCache::get_cache_path(CoreCache::CSS_CACHE_FILE);

        $cache = [
            'last_generated' => null,
            'file_url' => null,
            'file_size' => false,
        ];

        if (file_exists($cache_path) && is_readable($cache_path)) {
            $cache['file_url'] = CoreCache::get_cache_url(CoreCache::CSS_CACHE_FILE);
            $cache['last_generated'] = filemtime($cache_path);
            $cache['file_size'] = filesize($cache_path);
        }

        return new WP_REST_Response([
            'cache' => $cache,
        ]);
    }

    public function store(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $payload = $wprestRequest->get_json_params();

        try {
            $content = sprintf(
                "/*! %s v%s | %s | %s */\n%s",
                strtolower(Common::plugin_data('Name')),
                WIND_PRESS::VERSION,
                gmdate('Y-m-d H:i:s', time()),
                strtolower(Common::plugin_data('PluginURI')),
                base64_decode($payload['content'])
            );

            CoreCache::save_cache($content);
        } catch (\Throwable $throwable) {
            return new WP_REST_Response([
                'status' => 'KO',
                'message' => 'Save cache error: ' . $throwable->getMessage(),
            ], 500);
        }

        return $this->index($wprestRequest);
    }

    public function providers(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        return new WP_REST_Response([
            'providers' => CoreCache::get_providers(),
        ]);
    }

    public function providers_scan(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $stopwatch = Debug::stopwatch();

        $provider_id = $wprestRequest->get_param('provider_id');
        $metadata = $wprestRequest->get_param('metadata') ?? [];

        $provider = array_filter(CoreCache::get_providers(), static fn ($provider) => $provider['id'] === $provider_id);

        if ($provider === []) {
            return new WP_REST_Response([
                'status' => 'KO',
                'message' => 'The provider not found',
            ], 404);
        }

        $provider = array_shift($provider);

        $stopwatch->start('cache-provider:' . $provider['id'], 'cache-provider-scan');

        try {
            $result = CoreCache::fetch_contents($provider['callback'], $metadata);
        } catch (\Throwable $throwable) {
            return new WP_REST_Response([
                'status' => 'KO',
                'message' => 'Provider error: ' . $throwable->getMessage(),
            ], 500);
        }

        $event = $stopwatch->stop('cache-provider:' . $provider['id']);

        return new WP_REST_Response([
            'metadata' => [
                'provider_id' => $provider['id'],
                'provider_name' => $provider['name'],
                'profiling' => [
                    'unix_timestamp' => time(),
                    'duration' => $event->getDuration() . ' ms',
                    'memory' => sprintf('%.2F MiB', $event->getMemory() / 1024 / 1024),
                ],
                'next_batch' => $result['metadata']['next_batch'] ?? false,
            ],
            'contents' => $result['contents'],
            'status' => 'OK',
        ]);
    }
}
