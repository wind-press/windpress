<?php

/**
 * WindPress - The most effortless Tailwind CSS v4 integration for WordPress
 *
 * @wordpress-plugin
 * Plugin Name:         WindPress
 * Plugin URI:          https://wind.press
 * Description:         The most effortless Tailwind CSS v4 integration for WordPress
 * Version:             3.0.0-alpha.8
 * Requires at least:   6.0
 * Requires PHP:        7.4
 * Author:              WindPress
 * Donate link:         https://ko-fi.com/Q5Q75XSF7
 * Text Domain:         windpress
 * Domain Path:         /languages
 * License:             GPL-3.0-or-later
 *
 * @package             WindPress
 * @author              Joshua Gugun Siagian <suabahasa@gmail.com>
 */

declare(strict_types=1);

use WindPress\WindPress\Plugin;
use WindPress\WindPress\Utils\Requirement;

defined('ABSPATH') || exit;

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    if (file_exists(__DIR__ . '/vendor/scoper-autoload.php')) {
        require_once __DIR__ . '/vendor/scoper-autoload.php';
    } else {
        require_once __DIR__ . '/vendor/autoload.php';
    }

    $requirement = new Requirement();

    $requirement
        ->php('7.4')
        ->wp('6.0');

    if ($requirement->met()) {
        Plugin::get_instance()->boot();
    } else {
        add_action('admin_notices', fn () => $requirement->printNotice(), 0, 0);

        // Deactivate the plugin if the requirements are not met.
        // This is to ensure the activation process is executed at least once when the requirements are met.
        add_action('admin_init', fn () => deactivate_plugins(plugin_basename(__FILE__)), 0, 0);
    }
}
