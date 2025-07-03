<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, provide } from 'vue';
import type { NavigationMenuItem } from '@nuxt/ui'
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import { useWizard } from '@/dashboard/composables/useWizard';
import { __ } from '@wordpress/i18n';
import { useRouter } from 'vue-router';

const volumeStore = useVolumeStore()
const wizard = useWizard();
const router = useRouter()

const theme = ref(wizard.getDefaultTheme());
provide('theme', theme);

onBeforeMount(async () => {
    await volumeStore.initPull();
    theme.value = wizard.parseWizardFile(volumeStore.data.entries.find((entry: Entry) => entry.relative_path === 'wizard.css')?.content || '');
    // console.log('Parsed theme:', theme.value);
});

function saveWizard() {
    console.log('Saving wizard file...');

    const wizardFileContent = wizard.stringifyTheme(theme.value);

    // update or create the wizard.css entry in the volume store
    const existingEntry = volumeStore.data.entries.find((entry: Entry) => entry.relative_path === 'wizard.css');
    if (existingEntry) {
        existingEntry.content = wizardFileContent;
    } else {
        volumeStore.data.entries.push({
            name: 'wizard.css',
            relative_path: 'wizard.css',
            content: wizardFileContent,
            handler: 'internal',
        });
    }
}

onBeforeUnmount(() => {
    saveWizard();
});

const links = ref<NavigationMenuItem[][]>([
    [
        {
            label: __('Namespaces', 'windpress'),
            type: 'label',
        },
        {
            label: __('Screens', 'windpress'),
            icon: 'lucide:monitor-smartphone',
            to: router.resolve({ name: 'wizard.screens' }),
        },
        {
            label: __('Colors', 'windpress'),
            icon: 'lucide:swatch-book',
            to: router.resolve({ name: 'wizard.colors' }),
        },
        {
            label: __('Spacing', 'windpress'),
            icon: 'lucide:align-horizontal-space-around',
            to: router.resolve({ name: 'wizard.spacing' }),
        },
        {
            label: __('Typography', 'windpress'),
            icon: 'lucide:a-large-small',
            to: router.resolve({ name: 'wizard.typography' }),
        },
    ],
    [
        {
            label: __('Theme', 'windpress'),
            icon: 'i-lucide-cog',
            value: 'theme',
            description: __('You can customize components by using the `class` / `ui` props or in your app.config.ts.', 'windpress'),
        },
    ]
]);
</script>

<template>
    <UDashboardPanel id="wizard-1" :default-size="20" :min-size="15" :max-size="30" resizable class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Wizard', 'windpress')" class="text-sm">
            <template #leading>
                <UDashboardSidebarCollapse />
            </template>
            <template #right>
                <UTooltip :text="i18n.__('Save', 'windpress')">
                    <UButton icon="i-lucide-save" color="primary" variant="subtle" @click="saveWizard" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <UNavigationMenu :items="links[0]" orientation="vertical" />
        <UNavigationMenu :items="links[1]" orientation="vertical" class="mt-auto" />
    </UDashboardPanel>

    <RouterView />
</template>