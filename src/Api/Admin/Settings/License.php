<?php

/*
 * This file is part of the Yabe package.
 *
 * (c) Joshua Gugun Siagian <suabahasa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare(strict_types=1);

namespace Yabe\Siul\Api\Admin\Settings;

use SIUL;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use Yabe\Siul\Api\AbstractApi;
use Yabe\Siul\Api\ApiInterface;
use Yabe\Siul\Plugin;

class License extends AbstractApi implements ApiInterface
{
    public function __construct()
    {
    }

    public function get_prefix(): string
    {
        return 'admin/settings/license';
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
            $this->get_prefix() . '/activate',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->activate($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );

        register_rest_route(
            self::API_NAMESPACE,
            $this->get_prefix() . '/deactivate',
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => fn (\WP_REST_Request $wprestRequest): \WP_REST_Response => $this->deactivate($wprestRequest),
                'permission_callback' => fn (\WP_REST_Request $wprestRequest): bool => $this->permission_callback($wprestRequest),
            ]
        );
    }

    public function index(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        return new WP_REST_Response([
            'license' => $this->get_license(),
        ]);
    }

    public function activate(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $payload = $wprestRequest->get_json_params();

        $new_license_key = sanitize_text_field($payload['license']);

        if ($new_license_key === '') {
            return new WP_REST_Response([
                'message' => 'License key is empty',
            ], 400);
        }

        $plugin_updater = Plugin::get_instance()->plugin_updater;

        $response = $plugin_updater->activate($new_license_key);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return new WP_REST_Response([
                'message' => is_wp_error($response) ? $response->get_error_message() : 'An error occurred, please try again.',
            ], 500);
        }

        $license_data = json_decode(wp_remote_retrieve_body($response), null, 512, JSON_THROW_ON_ERROR);

        if ($license_data->license !== 'valid') {
            return new WP_REST_Response([
                'message' => $plugin_updater->error_message($license_data->error),
            ], 400);
        }

        update_option(SIUL::WP_OPTION . '_license', [
            'key' => $new_license_key,
            'opt_in_pre_release' => false,
        ]);

        $plugin_updater->drop_update_cache();

        return new WP_REST_Response([
            'message' => 'Plugin license key activated successfully',
            'license' => $this->get_license(),
        ]);
    }

    public function deactivate(WP_REST_Request $wprestRequest): WP_REST_Response
    {
        $plugin_updater = Plugin::get_instance()->plugin_updater;

        $plugin_updater->deactivate();
        $plugin_updater->drop_update_cache();

        update_option(SIUL::WP_OPTION . '_license', [
            'key' => '',
            'opt_in_pre_release' => false,
        ]);

        return new WP_REST_Response([
            'message' => 'Plugin license key de-activated successfully',
            'license' => $this->get_license(),
        ]);
    }

    private function get_license(): array
    {
        $license = get_option(SIUL::WP_OPTION . '_license', [
            'key' => '',
            'opt_in_pre_release' => false,
        ]);

        try {
            $license['is_activated'] = Plugin::get_instance()->plugin_updater->is_activated();
        } catch (\Throwable $throwable) {
            //throw $th;
            $license['is_activated'] = false;
        }

        return $license;
    }
}
