<script setup lang="ts">
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import { ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { useWizard } from '@/dashboard/composables/useWizard';

const volumeStore = useVolumeStore()
const wizard = useWizard();

const theme = ref(wizard.getDefaultTheme());

onBeforeMount(async () => {
    await volumeStore.initPull();

    theme.value = wizard.parseWizardFile(volumeStore.data.entries.find((entry: Entry) => entry.relative_path === 'wizard.css')?.content || '');

    console.log('Parsed theme:', theme.value);

    // add new spacing to the theme
    theme.value.namespaces.spacing = {
        ...theme.value.namespaces.spacing,
        '2xs': '0.125rem',
        '3xs': '0.0625rem',
        '4xs': '0.03125rem',
    }

    // update font mono value to 'JetBrains Mono', sans-serif
    theme.value.namespaces.font.mono = 'JetBrains Mono, monospace';
});


onBeforeUnmount(() => {
    // TODO: save the wizard file as string
    console.log('Saving wizard file...');

    const wizardFileContent = wizard.stringifyTheme(theme.value);

    console.log('Theme:', wizardFileContent);

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
});

</script>
<template>
    <!--  -->
</template>