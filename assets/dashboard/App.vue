<script setup lang="ts">
import { __ } from '@wordpress/i18n';
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import YabeWebfontIcon from '@/dashboard/assets/icon/yabe-webfont.svg';

const router = useRouter()
const toast = useToast()

const links = [
    [
        {
            label: __('Files', 'windpress'),
            icon: 'lucide:folder',
            to: router.resolve({ name: 'files' }),
            // badge: '4',
        },
        {
            label: __('Wizard', 'windpress'),
            icon: 'lucide:zap',
            // to: '/wizard'
        },
        {
            label: __('Logs', 'windpress'),
            icon: 'lucide:logs',
            to: router.resolve({ name: 'logs' }),
        },
        {
            label: __('Settings', 'windpress'),
            icon: 'lucide:settings',
            to: router.resolve({ name: 'settings' }),
            defaultOpen: true,
            children: [
                {
                    label: __('General', 'windpress'),
                    to: router.resolve({ name: 'settings.general' }),
                    exact: true,
                },
                {
                    label: __('Performance', 'windpress'),
                    to: router.resolve({ name: 'settings.performance' }),
                    exact: true,
                },
                {
                    label: __('Integrations', 'windpress'),
                    to: router.resolve({ name: 'settings.integrations' }),
                    exact: true,
                }
            ]
        },
    ],
    [
        {
            label: __('Documentation', 'windpress'),
            icon: 'i-lucide-book-open',
            to: `https://wind.press/docs?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${window.windpress._version}`,
            target: '_blank'
        },
        {
            label: __('Discussions', 'windpress'),
            icon: 'lucide:messages-square',
            to: 'https://github.com/wind-press/windpress/discussions',
            target: '_blank'
        }
    ]
]

const groups = computed(() => [
    {
        id: 'links',
        label: __('Go to', 'windpress'),
        items: links.flat()
    },
    {
        id: 'other-products',
        label: __('Other Products', 'windpress'),
        items: [
            {
                id: 'yabe-webfont',
                label: 'Yabe Webfont',
                avatar: {
                    src: YabeWebfontIcon,
                    alt: 'Yabe Webfont'
                },
                to: `https://webfont.yabe.land/?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${window.windpress._version}`,
                target: '_blank',
            },
        ]
    },
])

const askForReview = localStorage.getItem(`windpress-ask-for-review-${window.windpress._version}`) ?? -1;
const isAskForReview = ref(askForReview === -1 || (askForReview !== 'done' && askForReview !== 'never' && new Date() > new Date(askForReview)));
const askForReviewClick = (action: string) => {
    localStorage.setItem(`windpress-ask-for-review-${window.windpress._version}`, action);

    if (action === 'done') {
        window.open('https://wordpress.org/support/plugin/windpress/reviews/?filter=5/#new-post', '_blank');
    } else if (action === 'later') {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        localStorage.setItem(`windpress-ask-for-review-${window.windpress._version}`, date.toString());
    }

    // never
    isAskForReview.value = false;
};

onMounted(() => {
    if (isAskForReview.value) {
        toast.add({
            title: __('WindPress will always try to make you smile.', 'windpress'),
            icon: 'lucide:smile',
            description: __('Would you mind taking a moment to leave a review on WordPress.org? It would mean a lot to us!', 'windpress'),
            duration: 0,
            close: false,
            actions: [
                {
                    label: __(`OK, Let's do it!`, 'windpress'),
                    color: 'success',
                    variant: 'outline',
                    block: true,
                    onClick: () => {
                        askForReviewClick('done');
                    }
                },
                {
                    label: __('Later', 'windpress'),
                    color: 'neutral',
                    variant: 'ghost',
                    onClick: () => {
                        askForReviewClick('later');
                    },
                },
                {
                    label: __('Never', 'windpress'),
                    color: 'error',
                    variant: 'ghost',
                    onClick: () => {
                        askForReviewClick('never');
                    }
                }
            ]
        })
    }
});

</script>

<template>
    <Suspense>
        <UApp :toaster="{ class: 'windpress-style' }">
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