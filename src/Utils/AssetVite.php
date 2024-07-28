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

use WIND_PRESS;
use Exception;
use WP_HTML_Tag_Processor;

/**
 * Manifest friendly assets manager.
 *
 * @todo Add translation support. Use filter hook
 *
 * @since 3.0.0
 */
class AssetVite
{
    const VITE_CLIENT_SCRIPT_HANDLE = 'vite-client';

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
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Enqueue asset
     *
     * @since 0.1.0
     *
     * @param string $entry   Entrypoint to enqueue.
     * @param array  $options Enqueue options:
     *                      - 'handle'            (string) The handle for the enqueued asset.
     *                      - 'dependencies'      (array)  An array of handles for assets this asset depends on.
     *                      - 'in-footer'         (bool)   Whether to enqueue the asset in the footer.
     *                      - 'css-dependencies'  (array)  An array of handles for CSS assets this CSS asset depends on.
     *                      - 'css-media'         (string) The media attribute value for the stylesheet tag.
     *                      - 'css-only'          (bool)   Whether this asset is only CSS.
     * @return bool
     */
    public function enqueue_asset(string $entry, array $options): bool
    {
        return $this->_enqueue_asset(dirname(WIND_PRESS::FILE) . '/build', $entry, $options);
    }

    /**
     * Register asset
     *
     * @since 0.1.0
     *
     * @param string $entry   Entrypoint to enqueue.
     * @param array  $options Enqueue options:
     *                      - 'handle'            (string) The handle for the enqueued asset.
     *                      - 'dependencies'      (array)  An array of handles for assets this asset depends on.
     *                      - 'in-footer'         (bool)   Whether to enqueue the asset in the footer.
     *                      - 'css-dependencies'  (array)  An array of handles for CSS assets this CSS asset depends on.
     *                      - 'css-media'         (string) The media attribute value for the stylesheet tag.
     *                      - 'css-only'          (bool)   Whether this asset is only CSS.
     * @return array|null
     */
    public function register_asset(string $entry, array $options): ?array
    {
        return $this->_register_asset(dirname(WIND_PRESS::FILE) . '/build', $entry, $options);
    }

    /**
     * Get the asset base absolute path.
     *
     * @return string The asset base absolute path.
     */
    public static function asset_base_url(): string
    {
        return plugins_url('build/', WIND_PRESS::FILE);
    }

    /**
     * Get manifest data
     *
     * @since 0.1.0
     * @since 0.8.0 Use wp_json_file_decode().
     *
     * @param string $manifest_dir Path to manifest directory.
     *
     * @throws Exception Exception is thrown when the file doesn't exist, unreadble, or contains invalid data.
     *
     * @return object Object containing manifest type and data.
     */
    public function get_manifest(string $manifest_dir): object
    {
        $dev_manifest = 'vite-dev-server';
        // Avoid repeatedly opening & decoding the same file.
        static $manifests = [];

        $file_names = [$dev_manifest, 'manifest'];

        foreach ($file_names as $file_name) {
            $is_dev = $file_name === $dev_manifest;
            $manifest_path = "{$manifest_dir}/{$file_name}.json";

            if (isset($manifests[$manifest_path])) {
                return $manifests[$manifest_path];
            }

            if (is_file($manifest_path) && is_readable($manifest_path)) {
                break;
            }

            unset($manifest_path);
        }

        if (!isset($manifest_path)) {
            throw new Exception(esc_html(sprintf('[Vite] No manifest found in %s.', $manifest_dir)));
        }

        $manifest = wp_json_file_decode($manifest_path);

        if (!$manifest) {
            throw new Exception(esc_html(sprintf('[Vite] Failed to read manifest file %s.', $manifest_path)));
        }

        /**
         * Filter manifest data
         *
         * @param array  $manifest      Manifest data.
         * @param string $manifest_dir  Manifest directory path.
         * @param string $manifest_path Manifest file path.
         * @param bool   $is_dev        Whether this is a manifest for development assets.
         */
        $manifest = apply_filters('f!windpress/utils/asset_vite/vite_for_wp__manifest_data', $manifest, $manifest_dir, $manifest_path);

        $manifests[$manifest_path] = (object) [
            'data' => $manifest,
            'dir' => $manifest_dir,
            'is_dev' => $is_dev,
        ];

        return $manifests[$manifest_path];
    }

    /**
     * Filter script tag
     *
     * This creates a function to be used as callback for the `script_loader` filter
     * which adds `type="module"` attribute to the script tag.
     *
     * @since 0.1.0
     *
     * @param string $handle Script handle.
     *
     * @return void
     */
    public function filter_script_tag(string $handle): void
    {
        add_filter('script_loader_tag', fn (...$args) => $this->set_script_type_attribute($handle, ...$args), 10, 3);
    }

    /**
     * Add `type="module"` to a script tag
     *
     * @since 0.1.0
     * @since 0.8.0 Use WP_HTML_Tag_Processor.
     *
     * @param string $target_handle Handle of the script being targeted by the filter callback.
     * @param string $tag           Original script tag.
     * @param string $handle        Handle of the script that's currently being filtered.
     * @param string $src           Script source.
     *
     * @return string Script tag with attribute `type="module"` added.
     */
    public function set_script_type_attribute(string $target_handle, string $tag, string $handle, string $src): string
    {
        if ($target_handle !== $handle) {
            return $tag;
        }

        $processor = new WP_HTML_Tag_Processor($tag);

        $script_found = false;

        do {
            $script_found = $processor->next_tag('script');
        } while ($processor->get_attribute('src') !== $src);

        if ($script_found) {
            $processor->set_attribute('type', 'module');
        }

        return $processor->get_updated_html();
    }

    /**
     * Generate development asset src
     *
     * @since 0.1.0
     *
     * @param object $manifest Asset manifest.
     * @param string $entry    Asset entry name.
     *
     * @return string
     */
    public function generate_development_asset_src(object $manifest, string $entry): string
    {
        return sprintf(
            '%s/%s',
            untrailingslashit($manifest->data->origin),
            trim(preg_replace('/[\/]{2,}/', '/', "{$manifest->data->base}/{$entry}"), '/')
        );
    }

    /**
     * Register vite client script
     *
     * @since 0.1.0
     *
     * @param object $manifest Asset manifest.
     *
     * @return void
     */
    public function register_vite_client_script(object $manifest): void
    {
        if (wp_script_is(self::VITE_CLIENT_SCRIPT_HANDLE)) {
            return;
        }

        $src = $this->generate_development_asset_src($manifest, '@vite/client');

        // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
        wp_register_script(self::VITE_CLIENT_SCRIPT_HANDLE, $src, [], null, false);
        $this->filter_script_tag(self::VITE_CLIENT_SCRIPT_HANDLE);
    }

    /**
     * Inject react-refresh preamble script once, if needed
     *
     * @since 0.8.0
     *
     * @param object $manifest Asset manifest.
     * @return void
     */
    public function inject_react_refresh_preamble_script(object $manifest): void
    {
        static $is_react_refresh_preamble_printed = false;

        if ($is_react_refresh_preamble_printed) {
            return;
        }

        if (!in_array('vite:react-refresh', $manifest->data->plugins, true)) {
            return;
        }

        $react_refresh_script_src = $this->generate_development_asset_src($manifest, '@react-refresh');
        $script_position = 'after';
        $script = "
            import RefreshRuntime from \"{$react_refresh_script_src}\";
            RefreshRuntime.injectIntoGlobalHook(window);
            window.\$RefreshReg$ = () => {};
            window.\$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
        ";

        wp_add_inline_script(self::VITE_CLIENT_SCRIPT_HANDLE, $script, $script_position);
        add_filter(
            'wp_inline_script_attributes',
            function (array $attributes) use ($script_position): array {
                if (isset($attributes['id']) && $attributes['id'] === self::VITE_CLIENT_SCRIPT_HANDLE . "-js-{$script_position}") {
                    $attributes['type'] = 'module';
                }

                return $attributes;
            }
        );

        $is_react_refresh_preamble_printed = true;
    }

    /**
     * Load development asset
     *
     * @since 0.1.0
     *
     * @param object $manifest Asset manifest.
     * @param string $entry    Entrypoint to enqueue.
     * @param array  $options  Enqueue options.
     *
     * @return array|null Array containing registered scripts or NULL if the none was registered.
     */
    public function load_development_asset(object $manifest, string $entry, array $options): ?array
    {
        $this->register_vite_client_script($manifest);
        $this->inject_react_refresh_preamble_script($manifest);

        $dependencies = array_merge(
            [self::VITE_CLIENT_SCRIPT_HANDLE],
            $options['dependencies']
        );

        $src = $this->generate_development_asset_src($manifest, $entry);

        $this->filter_script_tag($options['handle']);

        // This is a development script, browsers shouldn't cache it.
        // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
        if (!wp_register_script($options['handle'], $src, $dependencies, null, $options['in-footer'])) {
            return null;
        }

        $assets = [
            'scripts' => [$options['handle']],
            'styles' => $options['css-dependencies'],
        ];

        /**
         * Filter registered development assets
         *
         * @param array  $assets   Registered assets.
         * @param object $manifest Manifest object.
         * @param string $entry    Entrypoint file.
         * @param array  $options  Enqueue options.
         */
        $assets = apply_filters('f!windpress/utils/asset_vite/vite_for_wp__development_assets', $assets, $manifest, $entry, $options);

        return $assets;
    }

    /**
     * Load production asset
     *
     * @since 0.1.0
     *
     * @param object $manifest Asset manifest.
     * @param string $entry    Entrypoint to enqueue.
     * @param array  $options  Enqueue options.
     *
     * @return array|null Array containing registered scripts & styles or NULL if there was an error.
     */
    public function load_production_asset(object $manifest, string $entry, array $options): ?array
    {
        $url = $this->prepare_asset_url($manifest->dir);

        if (!isset($manifest->data->{$entry})) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                wp_die(esc_html(sprintf('[Vite] Entry %s not found.', $entry)));
            }

            return null;
        }

        $assets = [
            'scripts' => [],
            'styles' => [],
        ];
        $item = $manifest->data->{$entry};
        $src = "{$url}/{$item->file}";

        if (!$options['css-only']) {
            $this->filter_script_tag($options['handle']);

            // Don't worry about browser caching as the version is embedded in the file name.
            // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
            if (wp_register_script($options['handle'], $src, $options['dependencies'], null, $options['in-footer'])) {
                $assets['scripts'][] = $options['handle'];
            }
        }

        if (!empty($item->css)) {
            foreach ($item->css as $index => $css_file_path) {
                $style_handle = "{$options['handle']}-{$index}";

                // Don't worry about browser caching as the version is embedded in the file name.
                // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
                if (wp_register_style($style_handle, "{$url}/{$css_file_path}", $options['css-dependencies'], null, $options['css-media'])) {
                    $assets['styles'][] = $style_handle;
                }
            }
        }

        /**
         * Filter registered production assets
         *
         * @param array  $assets   Registered assets.
         * @param object $manifest Manifest object.
         * @param string $entry    Entrypoint file.
         * @param array  $options  Enqueue options.
         */
        $assets = apply_filters('f!windpress/utils/asset_vite/vite_for_wp__production_assets', $assets, $manifest, $entry, $options);

        return $assets;
    }

    /**
     * Parse register/enqueue options
     *
     * @since 0.1.0
     *
     * @param array $options Array of options.
     *
     * @return array Array of options merged with defaults.
     */
    public function parse_options(array $options): array
    {
        $defaults = [
            'css-dependencies' => [],
            'css-media' => 'all',
            'css-only' => false,
            'dependencies' => [],
            'handle' => '',
            'in-footer' => false,
        ];

        return wp_parse_args($options, $defaults);
    }

    /**
     * Prepare asset url
     *
     * @author Justin Slamka <jslamka5685@gmail.com>
     * @since 0.4.0
     * @since 0.6.1 Normalize paths so they work on Windows as well.
     *
     * @param string $dir Asset directory.
     *
     * @return string
     */
    public function prepare_asset_url(string $dir)
    {
        $content_dir = wp_normalize_path(WP_CONTENT_DIR);
        $manifest_dir = wp_normalize_path($dir);
        $url = content_url(str_replace($content_dir, '', $manifest_dir));
        $url_matches_pattern = preg_match('/(?<address>http(?:s?):\/\/.*\/)(?<fullPath>wp-content(?<removablePath>\/.*)\/(?:plugins|themes)\/.*)/', $url, $url_parts);

        if ($url_matches_pattern === 0) {
            return $url;
        }

        ['address' => $address, 'fullPath' => $full_path, 'removablePath' => $removable_path] = $url_parts;

        return sprintf('%s%s', $address, str_replace($removable_path, '', $full_path));
    }

    /**
     * Register asset
     *
     * @since 0.1.0
     *
     * @see load_development_asset
     * @see load_production_asset
     *
     * @param string $manifest_dir Path to directory containing manifest file, usually `build` or `dist`.
     * @param string $entry        Entrypoint to enqueue.
     * @param array  $options      Enqueue options.
     *
     * @return array
     */
    public function _register_asset(string $manifest_dir, string $entry, array $options): ?array
    {
        try {
            $manifest = $this->get_manifest($manifest_dir);
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                wp_die(esc_html($e->getMessage()));
            }

            return null;
        }

        $options = $this->parse_options($options);
        $assets = $manifest->is_dev
            ? $this->load_development_asset($manifest, $entry, $options)
            : $this->load_production_asset($manifest, $entry, $options);

        return $assets;
    }

    /**
     * Enqueue asset
     *
     * @since 0.1.0
     *
     * @see _register_asset
     *
     * @param string $manifest_dir Path to directory containing manifest file, usually `build` or `dist`.
     * @param string $entry        Entrypoint to enqueue.
     * @param array  $options      Enqueue options.
     *
     * @return bool
     */
    public function _enqueue_asset(string $manifest_dir, string $entry, array $options): bool
    {
        $assets = $this->_register_asset($manifest_dir, $entry, $options);

        if (is_null($assets)) {
            return false;
        }

        $map = [
            'scripts' => 'wp_enqueue_script',
            'styles' => 'wp_enqueue_style',
        ];

        foreach ($assets as $group => $handles) {
            $func = $map[$group];

            foreach ($handles as $handle) {
                $func($handle);
            }
        }

        return true;
    }
}
