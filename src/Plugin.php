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

namespace WindPress\WindPress;

use Exception;
use WIND_PRESS;
use WP_Upgrader;
use WindPress\WindPress\Admin\AdminPage;
use WindPress\WindPress\Api\Router as ApiRouter;
use WindPress\WindPress\Core\Runtime;
use WindPress\WindPress\Integration\Loader as IntegrationLoader;
use WindPress\WindPress\Utils\Notice;

/**
 * Manage the plugin lifecycle and provides a single point of entry to the plugin.
 *
 * @since 1.0.0
 */
final class Plugin
{
    /**
     * Stores the instance, implementing a Singleton pattern.
     */
    private static self $instance;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private function __construct()
    {
    }

    /**
     * Singletons should not be cloneable.
     */
    private function __clone()
    {
    }

    /**
     * Singletons should not be restorable from strings.
     *
     * @throws Exception Cannot unserialize a singleton.
     */
    public function __wakeup()
    {
        throw new Exception('Cannot unserialize a singleton.');
    }

    /**
     * This is the static method that controls the access to the singleton
     * instance. On the first run, it creates a singleton object and places it
     * into the static property. On subsequent runs, it returns the client existing
     * object stored in the static property.
     */
    public static function get_instance(): self
    {
        if (! isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Boot the plugin.
     *
     * @link https://codex.wordpress.org/Plugin_API/Action_Reference
     */
    public function boot(): void
    {
        do_action('a!windpress/plugin:boot.start');

        // (de)activation hooks.
        register_activation_hook(WIND_PRESS::FILE, fn () => $this->activate_plugin());
        register_deactivation_hook(WIND_PRESS::FILE, fn () => $this->deactivate_plugin());

        // upgrade hooks.
        add_action('upgrader_process_complete', function (WP_Upgrader $wpUpgrader, array $options): void {
            if ($options['action'] === 'update' && $options['type'] === 'plugin') {
                foreach ($options['plugins'] as $plugin) {
                    if ($plugin === plugin_basename(WIND_PRESS::FILE)) {
                        $this->upgrade_plugin();
                    }
                }
            }
        }, 10, 2);

        add_action('plugins_loaded', fn () => $this->plugins_loaded(), 9);
        add_action('init', fn () => $this->init_plugin());

        do_action('a!windpress/plugin:boot.end');
    }

    /**
     * Handle the plugin's activation by (maybe) running database migrations
     * and initializing the plugin configuration.
     */
    private function activate_plugin(): void
    {
        do_action('a!windpress/plugin:activate_plugin.start');

        update_option(WIND_PRESS::WP_OPTION . '_version', WIND_PRESS::VERSION);

        do_action('a!windpress/plugin:activate_plugin.end');
    }

    /**
     * Handle plugin's deactivation by (maybe) cleaning up after ourselves.
     */
    private function deactivate_plugin(): void
    {
        do_action('a!windpress/plugin:deactivate_plugin.start');
        do_action('a!windpress/plugin:deactivate_plugin.end');
    }

    /**
     * Handle the plugin's upgrade by (maybe) running database migrations.
     */
    private function upgrade_plugin(): void
    {
        do_action('a!windpress/plugin:upgrade_plugin.start');
        do_action('a!windpress/plugin:upgrade_plugin.end');
    }

    /**
     * Initialize the plugin on WordPress' `init` hook.
     */
    private function init_plugin(): void
    {
        do_action('a!windpress/plugin:init_plugin.start');

        // Load translations.
        load_plugin_textdomain(WIND_PRESS::TEXT_DOMAIN, false, dirname(plugin_basename(WIND_PRESS::FILE)) . '/languages/');

        new ApiRouter();

        Runtime::get_instance()->init();
        // Instantiate the AdminPage class.
        new AdminPage();

        do_action('a!windpress/plugin:init_plugin.end');
    }

    /**
     * Initialize the plugin on WordPress' `plugins_loaded` hook.
     */
    private function plugins_loaded(): void
    {
        do_action('a!windpress/plugin:plugins_loaded.start');

        IntegrationLoader::get_instance()->register_integrations();

        if (is_admin()) {
            add_action('admin_notices', static fn () => Notice::admin_notices());
            add_filter('plugin_action_links_' . plugin_basename(WIND_PRESS::FILE), fn ($links) => $this->plugin_action_links($links));
        }

        do_action('a!windpress/plugin:plugins_loaded.end');
    }

    /**
     * Add plugin action links.
     *
     * @param array $links Plugin action links.
     * @return array Plugin action links.
     *
     * @todo Add settings link when the settings page is implemented.
     */
    private function plugin_action_links(array $links): array
    {
        $base_url = AdminPage::get_page_url();

        array_unshift($links, sprintf(
            '<a href="%s">%s</a>',
            esc_url(sprintf('%s#/settings', $base_url)),
            esc_html__('Settings', 'windpress')
        ));

        return $links;
    }
}
