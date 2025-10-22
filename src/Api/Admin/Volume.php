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

namespace WindPress\WindPress\Api\Admin;

use WindPress\WindPress\Api\AbstractApi;
use WindPress\WindPress\Api\ApiInterface;
use WindPress\WindPress\Core\Volume as CoreVolume;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class Volume extends AbstractApi implements ApiInterface
{
    public function __construct()
    {
    }

    public function get_prefix(): string
    {
        return 'admin/volume';
    }

    public function register_custom_endpoints(): void
    {
        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/index',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->index($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/store',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->store($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/handlers',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->handlers($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        // IMPORTANT: Register more specific routes BEFORE generic ones
        // Route: /versions/restore (most specific - exact match)
        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/versions/restore',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->restore_version($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
                'args' => [
                    'path' => [
                        'required' => true,
                        'type' => 'string',
                        'description' => 'Relative path of the file',
                    ],
                    'version' => [
                        'required' => true,
                        'type' => 'integer',
                        'description' => 'Version number to restore',
                    ],
                ],
            ]
        );

        // Route: /versions/{path}/{version} (more specific - has version number)
        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/versions/(?P<path>.+)/(?P<version>\d+)',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->get_version_content($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
                'args' => [
                    'path' => [
                        'required' => true,
                        'type' => 'string',
                        'description' => 'Relative path of the file',
                    ],
                    'version' => [
                        'required' => true,
                        'type' => 'integer',
                        'description' => 'Version number',
                    ],
                ],
            ]
        );

        // Route: /versions/{path} (least specific - catch all for version list)
        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/versions/(?P<path>.+)',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => fn (WP_REST_Request $wprestRequest): WP_REST_Response => $this->get_versions($wprestRequest),
                'permission_callback' => fn (WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
                'args' => [
                    'path' => [
                        'required' => true,
                        'type' => 'string',
                        'description' => 'Relative path of the file',
                    ],
                ],
            ]
        );
    }

    public function index(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        return new WP_REST_Response([
            'entries' => CoreVolume::get_entries(),
        ]);
    }

    public function store(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $payload = $wprestRequest->get_json_params();

        $entries = $payload['volume']['entries'];

        $result = CoreVolume::save_entries($entries);

        // Handle new response format with potential conflicts
        if (is_array($result)) {
            if (isset($result['success']) && $result['success'] === false) {
                // Return error or conflicts
                $status_code = isset($result['conflicts']) ? 409 : 400; // 409 Conflict, 400 Bad Request
                return new WP_REST_Response($result, $status_code);
            }

            return new WP_REST_Response([
                'message' => __('data stored successfully', 'windpress'),
                'success' => true,
            ]);
        }

        // Backward compatibility: old save_entries returned void
        return new WP_REST_Response([
            'message' => __('data stored successfully', 'windpress'),
            'success' => true,
        ]);
    }

    public function handlers(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        return new WP_REST_Response([
            'handlers' => CoreVolume::get_available_handlers(),
        ]);
    }

    public function get_versions(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $path = urldecode($wprestRequest->get_param('path'));

        $versions = CoreVolume::get_versions($path);

        return new WP_REST_Response([
            'versions' => $versions,
            'path' => $path,
        ]);
    }

    public function get_version_content(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $path = urldecode($wprestRequest->get_param('path'));
        $version = (int) $wprestRequest->get_param('version');

        $content = CoreVolume::get_version_content($path, $version);

        if ($content === null) {
            return new WP_REST_Response([
                'error' => __('Version not found', 'windpress'),
            ], 404);
        }

        return new WP_REST_Response([
            'content' => $content,
            'path' => $path,
            'version' => $version,
        ]);
    }

    public function restore_version(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $payload = $wprestRequest->get_json_params();

        $path = $payload['path'] ?? '';
        $version = (int) ($payload['version'] ?? 0);

        if (empty($path) || $version <= 0) {
            return new WP_REST_Response([
                'error' => __('Invalid path or version', 'windpress'),
            ], 400);
        }

        $success = CoreVolume::restore_version($path, $version);

        if (!$success) {
            return new WP_REST_Response([
                'error' => __('Failed to restore version', 'windpress'),
            ], 500);
        }

        // Get updated entry with new version_token
        $entries = CoreVolume::get_entries();
        $restored_entry = null;

        foreach ($entries as $entry) {
            if ($entry['relative_path'] === $path) {
                $restored_entry = $entry;
                break;
            }
        }

        return new WP_REST_Response([
            'message' => __('Version restored successfully', 'windpress'),
            'success' => true,
            'entry' => $restored_entry,
        ]);
    }
}
