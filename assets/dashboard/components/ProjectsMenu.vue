<script setup lang="ts">
import { ref, computed } from 'vue'
import Logo from '@/dashboard/assets/icon/windpress.svg';
import { version as tw4_version } from 'tailwindcss/package.json';

const props = defineProps<{
    collapsed?: boolean
}>()

const projects = ref([
    {
        label: 'WindPress',
        avatar: {
            src: Logo, // https://github.com/wind-press/wind.press/raw/refs/heads/main/public/favicon.svg
            alt: 'WindPress',
        },
    },
])

const selectedProject = ref(projects.value[0])

const items = computed(() => {
    return [
        [
            {
                label: `v${windpress._wp_version}`,
                icon: 'fa6-brands:wordpress',
            },
            {
                label: `v${tw4_version}`,
                icon: 'devicon:tailwindcss',
            },
            {
                label: `v${windpress._version}`,
                avatar: {
                    src: Logo,
                    alt: 'WindPress'
                },
            },
        ]
    ]
})
</script>

<template>
    <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }" :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <UButton v-bind="{
            ...selectedProject,
            label: collapsed ? undefined : selectedProject?.label,
            trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
        }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-(--ui-bg-elevated)" :class="[!collapsed && 'py-2']" :ui="{
            trailingIcon: 'text-(--ui-text-dimmed)'
        }" />
    </UDropdownMenu>
</template>