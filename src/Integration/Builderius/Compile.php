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

namespace WindPress\WindPress\Integration\Builderius;

use Builderius\Bundle\ComponentBundle\Registration\BuilderiusComponentPostType;
use Builderius\Bundle\DeliverableBundle\Registration\BulderiusDeliverableSubModulePostType;
use Builderius\Bundle\ModuleBundle\Registration\BuilderiusSavedCompositeModulePostType;
use Builderius\Bundle\ReleaseBundle\Registration\BulderiusReleaseArchivePostType;
use Builderius\Bundle\ReleaseBundle\Registration\BulderiusReleasePostType;
use Builderius\Bundle\SavedFragmentBundle\Registration\BuilderiusSavedFragmentPostType;
use Builderius\Bundle\SettingBundle\Registration\BuilderiusGlobalSettingsSetPostType;
use Builderius\Bundle\TemplateBundle\Registration\BuilderiusTemplatePostType;
use Builderius\Bundle\VCSBundle\Registration\BuilderiusBranchHeadCommitPostType;
use Builderius\Bundle\VCSBundle\Registration\BuilderiusBranchPostType;
use Builderius\Bundle\VCSBundle\Registration\BuilderiusCommitPostType;
use WP_Query;

/**
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 */
class Compile
{
    private array $post_meta_keys = [];

    public function __invoke(): array
    {
        if (! class_exists(BuilderiusTemplatePostType::class)) {
            return [];
        }

        $this->post_meta_keys = [
            'content_config'
        ];

        return $this->get_contents();
    }

    public function get_contents(): array
    {
        $contents = [];

        $post_types = [
            BuilderiusTemplatePostType::POST_TYPE,
            BuilderiusComponentPostType::POST_TYPE,
            BulderiusDeliverableSubModulePostType::POST_TYPE,
            BuilderiusSavedCompositeModulePostType::POST_TYPE,
            BulderiusReleaseArchivePostType::POST_TYPE,
            BulderiusReleasePostType::POST_TYPE,
            BuilderiusSavedFragmentPostType::POST_TYPE,
            BuilderiusGlobalSettingsSetPostType::POST_TYPE,
            BuilderiusBranchHeadCommitPostType::POST_TYPE,
            BuilderiusBranchPostType::POST_TYPE,
            BuilderiusCommitPostType::POST_TYPE,
        ];

        $post_types = apply_filters('f!windpress/integration/builderius/compile:get_contents.post_types', $post_types);

        $wpQuery = new WP_Query([
            'posts_per_page' => -1,
            'fields' => 'ids',
            'post_type' => $post_types,
            'post_status' => get_post_stati(),
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- This only run by trigger on specific event
            'meta_query' => [
                'relation' => 'OR',
                ...array_map(static fn ($key) => [
                    'key' => $key,
                ], $this->post_meta_keys),
            ],
        ]);

        foreach ($wpQuery->posts as $post_id) {
            $contents = [...$contents, ...$this->get_post_metas($post_id)];
        }

        return $contents;
    }

    public function get_post_metas($post_id): array
    {
        $contents = [];

        foreach ($this->post_meta_keys as $post_metum_key) {
            $meta_value = get_post_meta($post_id, $post_metum_key, true);
            if ($meta_value) {
                $contents[] = [
                    'name' => $post_id,
                    'content' => $meta_value,
                    'type' => 'json',
                ];
            }
        }

        return $contents;
    }
}
