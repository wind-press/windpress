<script setup>
import { computed } from 'vue';
import { useUIStore } from '@/dashboard/stores/ui.js';
import { useVolumeStore } from '@/dashboard/stores/volume.js';

import CodeEditor from './MainPanel/CodeEditor.vue';
import Settings from './MainPanel/Settings.vue';
import Wizard from './MainPanel/Wizard.vue';

const ui = useUIStore();
const volumeStore = useVolumeStore();

const panelComponents = {
    'code-editor': CodeEditor,
    'settings': Settings,
    'wizard': Wizard,
};

const codeEditorTitle = computed(() => {
    return volumeStore.data.entries.length === 0 || volumeStore.activeViewEntryRelativePath === null ? 'main.css' : volumeStore.activeViewEntryRelativePath;
});
</script>

<template>
    <div class="main-panel w:full flex flex:column flex-grow:1 bl:1|solid|sideBar-border ">
        <div class="tab-head flex flex:row {cursor:pointer;user-select:none;px:18;py:10;bt:1|solid|transparent;br:1|solid|tab-border;bb:1|solid|tab-border;fg:tab-inactiveForeground;bg:tab-inactiveBackground}>.tab-head__item,>.tab-head__space {bg:tab-activeBackground}>.tab-head__item:hover {bg:tab-activeBackground;bb:tab-border/.2;bt:1|solid|tab-activeBorderTop;fg:tab-activeForeground}>.tab-head__item.active">
            <div :class="{ active: ui.virtualState('main-panel.tab.active', 'code-editor').value === 'code-editor', '{inline-block}>.has-changed': false }" @click="ui.virtualState('main-panel.tab.active', 'code-editor').value = 'code-editor'" class="tab-head__item {mr:2}>svg">
                <template v-if="volumeStore.activeViewEntryRelativePath === 'main.css'">
                    <i-devicon-tailwindcss class="iconify" />
                </template>
                <template v-else-if="volumeStore.activeViewEntryRelativePath?.endsWith('.js')">
                    <i-fa6-brands-square-js class="iconify fg:#f0db4f" />
                </template>
                <template v-else-if="volumeStore.activeViewEntryRelativePath?.endsWith('.css')">
                    <i-fluent-document-css-24-filled class="iconify fg:#264de4" />
                </template>
                {{ codeEditorTitle }}
                <i-fa6-solid-circle class="iconify has-changed hidden ml:8 font:9 fg:current" />
            </div>
            <div :class="{ active: ui.virtualState('main-panel.tab.active').value === 'wizard' }" @click="ui.virtualState('main-panel.tab.active').value = 'wizard'" class="tab-head__item">
                <i-fa6-solid-bolt class="iconify mr:2" />
                {{ wp_i18n.__('Wizard', 'windpress') }}
            </div>
            <div :class="{ active: ui.virtualState('main-panel.tab.active').value === 'settings' }" @click="ui.virtualState('main-panel.tab.active').value = 'settings'" class="tab-head__item">
                <i-fa6-solid-gear class="iconify mr:2" />
                {{ wp_i18n.__('Settings', 'windpress') }}
            </div>
            <div class="tab-head__space flex-grow:1 br:hidden!"></div>
        </div>
        <div :class="{ 'overflow:auto!': ui.virtualState('main-panel.tab.active', 'code-editor').value !== 'code-editor' }" class="tab-body h:full bg:editor-background">
            <div class="content-panel h:full">
                <!-- content -->
                <div class="h:full">
                    <!-- <KeepAlive> -->
                        <Suspense>
                            <component :is="panelComponents[ui.virtualState('main-panel.tab.active', 'code-editor').value]" />
                        </Suspense>
                    <!-- </KeepAlive> -->
                </div>
            </div>
            <div class="dock-panel">
                <div class="debug-logs"></div>
                <div class="generated-css"></div>
            </div>
        </div>
    </div>
</template>