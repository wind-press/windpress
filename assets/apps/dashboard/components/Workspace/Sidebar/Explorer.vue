<script setup>
import { onMounted } from 'vue';
import { __ } from '@wordpress/i18n';
import { useVolumeStore } from '@/dashboard/stores/volume.js';
import { useNotifier } from '@/dashboard/library/notifier';
import { useUIStore } from '@/dashboard/stores/ui.js';

const ui = useUIStore();
const volumeStore = useVolumeStore();
const notifier = useNotifier();

function addNewEntry() {
    const fileName = prompt(__('Enter the file name (css or js)', 'windpress'), 'theme.css');

    if (!fileName) {
        notifier.alert(__('File name is required', 'windpress'));
        return;
    }

    if (!fileName.endsWith('.css') && !fileName.endsWith('.js')) {
        notifier.alert(__('File extension must be .css or .js', 'windpress'));
        return;
    }

    // only alphabet, numbers, dash, underscore, and dot are allowed
    if (!/^[a-zA-Z0-9_.-]+$/.test(fileName)) {
        notifier.alert(__('Only alphanumeric, dash, underscore, and dot are allowed', 'windpress'));
        return;
    }

    if (volumeStore.data.entries.find(entry => entry.relative_path === `custom/${fileName}`)) {
        notifier.alert(__(`A file named "custom/${fileName}" already exists`, 'windpress'));
        return;
    }

    volumeStore.addNewEntry(fileName);
}

function switchToEntry(entry) {
    volumeStore.activeViewEntryRelativePath = entry.relative_path;

    ui.virtualState('main-panel.tab.active', 'code-editor').value = 'code-editor'
}

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
                <font-awesome-icon :icon="['fas', 'plus']" class="m:4" />
            </button>
        </div>
    </div>

    <div class="folders-content ">
        <div class="folders-items flex flex:col {w:30}>.folders-item_.item-icon {w:full;font:1rem;max-w:20}_.item-icon_svg">
            <div v-for="entry in volumeStore.data.entries" @click="switchToEntry(entry)" :class="volumeStore.activeViewEntryRelativePath === entry.relative_path ? 'bg:gray-20/.4 bg:gray-20/.2@dark' : ''" class="folders-item folders-file px:14 py:6 cursor:pointer flex">
                <div class="item-icon">
                    <template v-if="entry.relative_path === 'main.css'">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 54 33" class="h:1em mr:2 vertical-align:-0.125em">
                            <g clip-path="url(#prefix__clip0)">
                                <path fill="#38bdf8" fill-rule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clip-rule="evenodd" />
                            </g>
                            <defs>
                                <clipPath id="prefix__clip0">
                                    <path fill="#fff" d="M0 0h54v32.4H0z" />
                                </clipPath>
                            </defs>
                        </svg>
                    </template>
                    <template v-else-if="entry.relative_path.endsWith('.js')">
                        <font-awesome-icon :icon="['fab', 'js-square']" />
                    </template>
                    <template v-else-if="entry.relative_path.endsWith('.css')">
                        <font-awesome-icon :icon="['fab', 'css3-alt']" />
                    </template>
                </div>
                <span>
                    {{ entry.relative_path }}
                </span>
            </div>
        </div>
    </div>
</template>