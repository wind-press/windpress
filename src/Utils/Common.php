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

namespace WindPress\WindPress\Utils;

use EDD_SL\PluginUpdater;
use Exception;
use WIND_PRESS;

/**
 * Common utility functions for the plugin.
 *
 * @since 3.0.0
 */
class Common
{
    /**
     * Check the type of the current request.
     *
     * @param string $type The type of the request. Available values: `admin`, `ajax`, `frontend`, `rest`, `cron`.
     */
    public static function is_request(string $type): bool
    {
        switch ($type) {
            case 'admin':
                return is_admin();
            case 'ajax':
                return wp_doing_ajax();
            case 'rest':
                return defined('REST_REQUEST') && REST_REQUEST;
            case 'cron':
                return wp_doing_cron();
            case 'json':
                return wp_is_json_request();
            case 'xmlrpc':
                return defined('XMLRPC_REQUEST') && XMLRPC_REQUEST;
            case 'xml':
                return wp_is_xml_request();
            case 'frontend':
                return (! is_admin() || wp_doing_ajax()) && ! wp_doing_cron();
            default:
                return false;
        }
    }

    /**
     * Get the plugin's data.
     *
     * @param string $key The key to retrieve.
     * @return mixed
     */
    public static function plugin_data(?string $key = null)
    {
        if (! function_exists('get_plugin_data')) {
            require_once(ABSPATH . 'wp-admin/includes/plugin.php');
        }

        $plugin_data = wp_cache_get('plugin_data', WIND_PRESS::WP_OPTION);

        if (! $plugin_data) {
            $plugin_data = get_plugin_data(WIND_PRESS::FILE);
            wp_cache_set('plugin_data', $plugin_data, WIND_PRESS::WP_OPTION);
        }

        return $key ? $plugin_data[$key] : $plugin_data;
    }

    public static function is_updater_library_available(): bool
    {
        return class_exists(PluginUpdater::class);
    }

    public static function random_slug(int $length = 21): string
    {
        return (new \Hidehalo\Nanoid\Client())->generateId($length, \Hidehalo\Nanoid\Client::MODE_DYNAMIC);
    }

    /**
     * Redirect to the given location. If headers are already sent, use a meta refresh.
     *
     * @param string $location The location to redirect to.
     * @param bool $safe Whether to use wp_safe_redirect() or not.
     */
    public static function redirect(string $location, bool $safe = false, int $status = 302, string $x_redirect_by = 'WordPress')
    {
        if (! headers_sent()) {
            if ($safe) {
                wp_safe_redirect($location, $status, $x_redirect_by);
            } else {
                wp_redirect($location, $status, $x_redirect_by);
            }
        } else {
            echo '<meta http-equiv="refresh" content="0;url=' . esc_url($location) . '">';
        }

        exit;
    }

    /**
     * Save the worker result into the file.
     *
     * @param mixed $content The content of the file.
     * @param string $file_path The file path.
     * @param int $flags The flags to pass to the file_put_contents() function.
     * @throws Exception
     */
    public static function save_file($content, string $file_path, int $flags = 0): void
    {
        /**
         * @var \WP_Filesystem_Base $wp_filesystem
         */
        global $wp_filesystem;

        if (! file_exists($file_path)) {
            wp_mkdir_p(dirname($file_path));
        }

        if (! $wp_filesystem) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $result = $wp_filesystem->put_contents($file_path, $content, $flags);

        if ($result === false) {
            throw new Exception('Failed to save to file.', 500);
        }

        // if write is successful continue
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file
        $saved_content = file_get_contents($file_path);

        // if read is successful continue
        if ($saved_content === false) {
            throw new Exception('The saved file is not readable.', 500);
        }
    }
}
