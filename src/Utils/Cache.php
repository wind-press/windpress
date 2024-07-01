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

/**
 * Cache utility functions for the plugin.
 *
 * @since 1.0.0
 */
class Cache
{
    /**
     * Clear the cache from various cache plugins.
     */
    public static function flush_cache_plugin()
    {
        /**
         * WordPress Object Cache
         * @see https://developer.wordpress.org/reference/classes/wp_object_cache/
         */
        \wp_cache_flush();

        /**
         * WP Rocket
         * @see https://docs.wp-rocket.me/article/92-rocketcleandomain
         */
        if (function_exists('rocket_clean_domain')) {
            \rocket_clean_domain();
        }

        /**
         * WP Super Cache
         * @see https://github.com/Automattic/wp-super-cache/blob/a0872032b1b3fc6847f490eadfabf74c12ad0135/wp-cache-phase2.php#L3013
         */
        if (function_exists('wp_cache_clear_cache')) {
            \wp_cache_clear_cache();
        }

        /**
         * W3 Total Cache
         * @see https://github.com/BoldGrid/w3-total-cache/blob/3a094493064ea60d727b3389dee813639860ef49/w3-total-cache-api.php#L259
         */
        if (function_exists('w3tc_flush_all')) {
            \w3tc_flush_all();
        }

        /**
         * WP Fastest Cache
         * @see https://www.wpfastestcache.com/tutorial/delete-the-cache-by-calling-the-function/
         */
        if (function_exists('wpfc_clear_all_cache')) {
            \wpfc_clear_all_cache(true);
        }

        /**
         * LiteSpeed Cache
         * @see https://docs.litespeedtech.com/lscache/lscwp/api/#purge-all-existing-caches
         */
        do_action('litespeed_purge_all');

        /**
         * SG Optimizer
         * @see https://plugins.trac.wordpress.org/browser/sg-cachepress/trunk/core/Supercacher/Supercacher.php
         * @see https://plugins.trac.wordpress.org/browser/sg-cachepress/trunk/core/File_Cacher/File_Cacher.php
         */
        if (class_exists('\SiteGround_Optimizer\Supercacher\Supercacher')) {
            \SiteGround_Optimizer\Supercacher\Supercacher::purge_cache();
            \SiteGround_Optimizer\File_Cacher\File_Cacher::get_instance()->purge_everything();
        }
    }
}
