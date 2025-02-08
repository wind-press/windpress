<script setup>
import { onBeforeMount, onMounted } from 'vue';
import { __, sprintf } from '@wordpress/i18n';
import { useVolumeStore } from '@/dashboard/stores/volume';
import { useNotifier } from '@/dashboard/library/notifier';
import { useUIStore } from '@/dashboard/stores/ui';
import { useLogStore } from '@/dashboard/stores/log';
import { useSettingsStore } from '@/dashboard/stores/settings';

const ui = useUIStore();
const volumeStore = useVolumeStore();
const logStore = useLogStore();
const notifier = useNotifier();
const settingsStore = useSettingsStore();

function addNewEntry() {
    const filePath = prompt(__('Enter the file name (css or js)', 'windpress'), 'theme.css');

    if (!filePath) {
        notifier.alert(__('File name is required', 'windpress'));
        return;
    }

    if (!filePath.endsWith('.css') && !filePath.endsWith('.js')) {
        notifier.alert(__('File extension must be .css or .js', 'windpress'));
        return;
    }

    // only alphabet, numbers, dash, underscore, forward slash, and dot are allowed.
    if (!/^[a-zA-Z0-9_.\-\/]+$/.test(filePath)) {
        notifier.alert(__('Only alphanumeric, dash, underscore, forward slash, and dot are allowed', 'windpress'));
        return;
    }

    if (volumeStore.data.entries.find(entry => entry.relative_path === `${filePath}` && entry.hidden !== true)) {
        notifier.alert(__(`A file named "${filePath}" already exists`, 'windpress'));
        return;
    }

    try {
        volumeStore.addNewEntry(filePath);
        logStore.add({
            type: 'success',
            message: sprintf(__('File %s created', 'windpress'), filePath),
        });
    } catch (error) {
        notifier.alert(error.message);
    }
}

function switchToEntry(entry) {
    volumeStore.activeViewEntryRelativePath = entry.relative_path;

    ui.virtualState('main-panel.tab.active', 'code-editor').value = 'code-editor';
}

function softDeleteEntry(entry) {
    if (confirm(__('Are you sure you want to delete this file?', 'windpress'))) {
        volumeStore.softDeleteEntry(entry);
        logStore.add({
            type: 'warning',
            message: sprintf(__('File %s deleted', 'windpress'), entry.relative_path),
        });
    }
}

function resetEntry(entry) {
    if (confirm(__('Are you sure you want to reset this file?', 'windpress'))) {
        volumeStore.resetEntry(entry);
        logStore.add({
            type: 'warning',
            message: sprintf(__('File %s reseted', 'windpress'), entry.relative_path),
        });
    }
}

onBeforeMount(() => {
    if (Object.keys(settingsStore.options).length === 0) {
        settingsStore.doPull();
    }
});

onMounted(() => {
    if (!volumeStore.data.entries.length) {
        volumeStore.doPull();
    }

});
</script>

<template>
    <div class="explorer-header px:20 py:10 uppercase font:12 flex">
        <div class="flex-grow:1 align-content:center">
            {{ wp_i18n.__('Explorer: WordPress', 'windpress') }}
        </div>
        <div class="justify-self:end">
            <button @click="addNewEntry" :title="wp_i18n.__('Add New File', 'windpress')" class="flex button button-secondary b:0! bg:transparent! bg:button-secondaryHoverBackground!:hover fg:foreground! my:auto width:auto h:auto min-h:initial! align-items:center" v-ripple>
                <i-fa6-solid-plus class="iconify m:4" />
            </button>
        </div>
    </div>

    <div class="folders-content ">
        <div class="folders-items flex flex:col {w:30}>.folders-item_.item-icon {w:full;font:1rem;max-w:20}_.item-icon_svg">
            <div v-for="entry in volumeStore.data.entries.filter(entry => entry.hidden !== true)" @click="switchToEntry(entry)" :class="volumeStore.activeViewEntryRelativePath === entry.relative_path ? 'bg:gray-20/.4 bg:gray-20/.2@dark' : ''" class="folders-item folders-file px:14 py:6 cursor:pointer flex">
                <div class="item-icon">
                    <template v-if="entry.relative_path === 'main.css' || (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry.relative_path === 'tailwind.config.js' || entry.relative_path === 'wizard.js'))">
                        <i-devicon-tailwindcss class="iconify" />
                    </template>
                    <template v-else-if="entry.relative_path.endsWith('.js')">
                        <i-fa6-brands-square-js class="iconify fg:#f0db4f" />
                    </template>
                    <template v-else-if="entry.relative_path.endsWith('.css')">
                        <i-fluent-document-css-24-filled class="iconify fg:#264de4" />
                    </template>
                </div>
                <div class="flex-grow:1">
                    {{ entry.relative_path }}
                    <span v-if="entry.relative_path === 'main.css'" class="fg:gray-50 fg:gray-30@dark">
                        [v{{ Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) }}]
                    </span>
                </div>
                <div class="float:right">
                    <template v-if="entry.relative_path === 'main.css' || (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry.relative_path === 'tailwind.config.js' || entry.relative_path === 'wizard.js'))">
                        <!-- reset -->
                        <button @click="resetEntry(entry)" :title="wp_i18n.__('Reset', 'windpress')" class="button button-secondary b:0! bg:transparent! bg:button-secondaryHoverBackground!:hover fg:foreground! line-height:normal min-h:initial! align-items:center" v-ripple>
                            <i-bx-reset class="iconify m:0 fg:red-50" />
                        </button>
                    </template>
                    <template v-else>
                        <button @click.stop="softDeleteEntry(entry)" :title="wp_i18n.__('Delete', 'windpress')" class="button button-secondary b:0! bg:transparent! bg:button-secondaryHoverBackground!:hover fg:foreground! line-height:normal min-h:initial! align-items:center" v-ripple>
                            <i-octicon-trash-16 class="iconify m:0 fg:red-50" />
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>