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
 * Save Volume Entry Ability
 * 
 * Saves or updates a single file in the WindPress Simple File System.
 * 
 * @since 3.2.0
 */
class SaveVolumeEntry
{
    /**
     * Execute the ability
     * 
     * @param array $input Input with file data
     * @return array|WP_Error Success status with entry data or error
     */
    public static function execute($input)
    {
        // Set default handler if not provided
        if (! isset($input['handler'])) {
            $input['handler'] = 'internal';
        }

        // Validate required fields
        $required_fields = ['name', 'relative_path', 'content'];
        foreach ($required_fields as $field) {
            if (! isset($input[$field])) {
                return new WP_Error(
                    'invalid_input',
                    sprintf(
                        /* translators: %s: field name */
                        __('Field "%s" is required.', 'windpress'),
                        $field
                    )
                );
            }
        }

        try {
            // Save the entry using the existing Volume::save_entries method
            Volume::save_entries([$input]);

            // Retrieve the saved entry to return
            $entries = Volume::get_entries();
            $saved_entry = null;

            foreach ($entries as $entry) {
                if ($entry['relative_path'] === $input['relative_path']) {
                    $saved_entry = $entry;
                    break;
                }
            }

            return [
                'success' => true,
                'message' => sprintf(
                    /* translators: %s: file name */
                    __('File "%s" saved successfully.', 'windpress'),
                    $input['name']
                ),
                'entry' => $saved_entry,
            ];
        } catch (\Throwable $throwable) {
            return new WP_Error(
                'save_failed',
                sprintf(
                    /* translators: %s: error message */
                    __('Failed to save entry: %s', 'windpress'),
                    $throwable->getMessage()
                )
            );
        }
    }
}
