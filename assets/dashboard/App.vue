<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import YabeWebfontIcon from '@/dashboard/assets/icon/yabe-webfont.svg';

const route = useRoute()
const router = useRouter()

const links = [
    [
        {
            label: 'Files',
            icon: 'lucide:folder',
            to: router.resolve({ name: 'files' })
            // badge: '4',
        },
        {
            label: 'Wizard',
            icon: 'lucide:zap',
            // to: '/wizard'
        },
        {
            label: 'Logs',
            icon: 'lucide:logs',
            // to: '/logs'
        },
        {
            label: 'Settings',
            // to: '/settings',
            icon: 'lucide:settings',
            defaultOpen: true,
            children: [
                {
                    label: 'General',
                    // to: '/settings',
                    exact: true
                },
                {
                    label: 'License',
                    // to: '/settings/license',
                },
                {
                    label: 'Performance',
                    // to: '/settings/performance',
                },
                {
                    label: 'Integrations',
                    // to: '/settings/integrations',
                }
            ]
        },
    ],
    [
        {
            label: 'Documentation',
            icon: 'i-lucide-book-open',
            to: `https://wind.press/docs?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${windpress._version}`,
            target: '_blank'
        },
        {
            label: 'Discussions',
            icon: 'lucide:messages-square',
            to: 'https://github.com/wind-press/windpress/discussions',
            target: '_blank'
        }
    ]
]

const groups = computed(() => [
    {
        id: 'links',
        label: 'Go to',
        items: links.flat()
    },
    {
        id: 'other-products',
        label: 'Other Products',
        items: [
            {
                id: 'yabe-webfont',
                label: 'Yabe Webfont',
                avatar: {
                    src: YabeWebfontIcon,
                    alt: 'Yabe Webfont'
                },
                to: `https://webfont.yabe.land/?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${windpress._version}`,
                target: '_blank',
            },
        ]
    }
])

</script>

<template>
    <Suspense>
        <UApp>
            <UDashboardGroup storage="local" class="bg-(--ui-bg) text-(--ui-text) top-(--wp-admin--admin-bar--height) left-(--wp-admin--sidebar-width) right-0 bottom-0">
                <UDashboardSearch :groups="groups" />

                <UDashboardSidebar collapsible resizable class="bg-(--ui-bg-elevated)/25 min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]" :ui="{ root: 'flex', footer: 'lg:border-t lg:border-(--ui-border)' }">
                    <template #header="{ collapsed }">
                        <ProjectsMenu :collapsed="collapsed" />
                    </template>

                    <template #default="{ collapsed }">
                        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" />

                        <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" />

                        <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" class="mt-auto" />
                    </template>

                    <template #footer="{ collapsed }">
                        <UserMenu :collapsed="collapsed" />
                    </template>
                </UDashboardSidebar>

                <RouterView />
            </UDashboardGroup>
        </UApp>
    </Suspense>
</template>