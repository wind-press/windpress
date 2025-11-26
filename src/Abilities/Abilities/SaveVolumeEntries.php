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

namespace WindPress\WindPress\Abilities\Abilities;

use WindPress\WindPress\Core\Volume;
use WP_Error;

/**
 * Save Volume Entries Ability
 * 
 * Saves or updates multiple files in the WindPress Simple File System at once.
 * 
 * @since 3.2.0
 */
class SaveVolumeEntries
{
    /**
     * Execute the ability
     * 
     * @param array $input Input with entries array
     * @return array|WP_Error Success status or error
     */
    public static function execute($input)
    {
        $entries = $input['entries'] ?? [];

        if (empty($entries) || ! is_array($entries)) {
            return new WP_Error(
                'invalid_input',
                __('Entries array is required.', 'windpress')
            );
        }

        try {
            Volume::save_entries($entries);

            return [
                'success' => true,
                'message' => sprintf(
                    /* translators: %d: number of entries */
                    _n(
                        '%d entry saved successfully.',
                        '%d entries saved successfully.',
                        count($entries),
                        'windpress'
                    ),
                    count($entries)
                ),
            ];
        } catch (\Throwable $throwable) {
            return new WP_Error(
                'save_failed',
                sprintf(
                    /* translators: %s: error message */
                    __('Failed to save entries: %s', 'windpress'),
                    $throwable->getMessage()
                )
            );
        }
    }
}
