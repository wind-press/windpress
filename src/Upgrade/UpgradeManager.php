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

namespace WindPress\WindPress\Upgrade;

use Exception;
use WIND_PRESS;
use WindPress\WindPress\Core\Volume;

/**
 * @since 3.0.0
 */
class UpgradeManager
{
    /**
     * Stores the instance, implementing a Singleton pattern.
     */
    private static self $instance;

    private const UPGRADE_OPTION_KEY = 'windpress_upgrade_state';
    
    private array $upgrades = [
        '3.3.45' => 'up_to_3_3_45',
    ];

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private function __construct() {}

    /**
     * Singletons should not be cloneable.
     */
    private function __clone() {}

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

    public function run(): void
    {
        $upgrade_state = $this->get_upgrade_state();
        $current_version = $this->get_current_version();
        
        foreach ($this->upgrades as $version => $method) {
            if ($this->should_run_upgrade($version, $upgrade_state, $current_version)) {
                try {
                    $this->$method();
                    $this->mark_upgrade_complete($version);
                } catch (Exception $e) {
                    error_log("WindPress Upgrade Error for version {$version}: " . $e->getMessage());
                    $this->mark_upgrade_failed($version, $e->getMessage());
                }
            }
        }
    }

    private function get_upgrade_state(): array
    {
        return get_option(self::UPGRADE_OPTION_KEY, []);
    }

    private function save_upgrade_state(array $state): void
    {
        update_option(self::UPGRADE_OPTION_KEY, $state);
    }

    private function get_current_version(): string
    {
        return WIND_PRESS::WP_OPTION['version'];
    }

    private function should_run_upgrade(string $version, array $upgrade_state, string $current_version): bool
    {
        if (isset($upgrade_state[$version]) && $upgrade_state[$version]['status'] === 'completed') {
            return false;
        }

        return version_compare($current_version, $version, '>=');
    }

    private function mark_upgrade_complete(string $version): void
    {
        $upgrade_state = $this->get_upgrade_state();
        $upgrade_state[$version] = [
            'status' => 'completed',
            'completed_at' => current_time('mysql'),
        ];
        $this->save_upgrade_state($upgrade_state);
    }

    private function mark_upgrade_failed(string $version, string $error_message): void
    {
        $upgrade_state = $this->get_upgrade_state();
        $upgrade_state[$version] = [
            'status' => 'failed',
            'error' => $error_message,
            'failed_at' => current_time('mysql'),
        ];
        $this->save_upgrade_state($upgrade_state);
    }

    public function reset_upgrade(string $version): bool
    {
        if (!isset($this->upgrades[$version])) {
            return false;
        }

        $upgrade_state = $this->get_upgrade_state();
        unset($upgrade_state[$version]);
        $this->save_upgrade_state($upgrade_state);
        
        return true;
    }

    public function get_upgrade_status(string $version): ?array
    {
        $upgrade_state = $this->get_upgrade_state();
        return $upgrade_state[$version] ?? null;
    }

    public function get_all_upgrade_statuses(): array
    {
        $upgrade_state = $this->get_upgrade_state();
        $result = [];
        
        foreach ($this->upgrades as $version => $method) {
            $result[$version] = [
                'method' => $method,
                'status' => $upgrade_state[$version] ?? ['status' => 'pending'],
            ];
        }
        
        return $result;
    }

    /**
     * @version 3.3.45
     */
    public function up_to_3_3_45() {
        $entries = Volume::get_entries();

        // Introducing the Wizard feature - add wizard.css import to main.css
        $main_css_key = array_search('main.css', array_column($entries, 'name'), true);
        
        if ($main_css_key !== false) {
            $main_css_content = $entries[$main_css_key]['content'];
            
            // Check if wizard.css import is already present
            if (! preg_match('/@import\s+["\']\.\/wizard\.css["\'];/', $main_css_content)) {
                // Add the import at the end of the file
                $main_css_content .= "\n@import \"./wizard.css\";";
                $entries[$main_css_key]['content'] = $main_css_content;
                
                // Save the updated entries
                Volume::save_entries($entries);
            }
        }
    }
}
