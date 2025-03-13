<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import YabeWebfontIcon from '@/dashboard/assets/icon/yabe-webfont.svg';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const links = [
    [
        {
            label: 'Files',
            icon: 'lucide:folder',
            to: router.resolve({ name: 'files' }),
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
            icon: 'lucide:settings',
            to: router.resolve({ name: 'settings' }),
            defaultOpen: true,
            children: [
                {
                    label: 'General',
                    to: router.resolve({ name: 'settings.general' }),
                    exact: true,
                },
                {
                    label: 'Performance',
                    to: router.resolve({ name: 'settings.performance' }),
                    exact: true,
                },
                {
                    label: 'Integrations',
                    to: router.resolve({ name: 'settings.integrations' }),
                    exact: true,
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
            title: 'WindPress will always try to make you smile.',
            icon: 'lucide:smile',
            description: 'Would you mind taking a moment to leave a review on WordPress.org? It would mean a lot to us!',
            duration: 0,
            close: false,
            actions: [
                {
                    label: `OK, Let's do it!`,
                    color: 'success',
                    variant: 'outline',
                    block: true,
                    onClick: () => {
                        askForReviewClick('done');
                    }
                },
                {
                    label: 'Later',
                    color: 'neutral',
                    variant: 'ghost',
                    onClick: () => {
                        askForReviewClick('later');
                    },
                },
                {
                    label: 'Never',
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