<script setup>
import { useTailwindStore } from '@/dashboard/stores/tailwind.js';
import { useUIStore } from '@/dashboard/stores/ui.js';

import MainCSS from './MainPanel/MainCSS.vue';
import Settings from './MainPanel/Settings.vue';
import Wizard from './MainPanel/Wizard.vue';

const ui = useUIStore();
const twStore = useTailwindStore();

const panelComponents = {
    'main.css': MainCSS,
    'settings': Settings,
    'wizard': Wizard,
};
</script>

<template>
    <div class="main-panel w:full flex flex:column flex-grow:1 bl:1|solid|sideBar-border ">
        <div class="tab-head flex flex:row {cursor:pointer;user-select:none;px:18;py:10;bt:1|solid|transparent;br:1|solid|tab-border;bb:1|solid|tab-border;fg:tab-inactiveForeground;bg:tab-inactiveBackground}>.tab-head__item,>.tab-head__space {bg:tab-activeBackground}>.tab-head__item:hover {bg:tab-activeBackground;bb:tab-border/.2;bt:1|solid|tab-activeBorderTop;fg:tab-activeForeground}>.tab-head__item.active">
            <div :class="{ active: ui.virtualState('main-panel.tab.active', 'main.css').value === 'main.css', '{inline-block}>.has-changed' : twStore.hasChanged('main_css') }" @click="ui.virtualState('main-panel.tab.active', 'main.css').value = 'main.css'" class="tab-head__item">
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
                main.css
                <font-awesome-icon :icon="['fas', 'circle']" class="has-changed hidden ml:8 font:9 fg:current" />  
            </div>
            <div :class="{ active: ui.virtualState('main-panel.tab.active').value === 'wizard' }" @click="ui.virtualState('main-panel.tab.active').value = 'wizard'" class="tab-head__item">
                <font-awesome-icon :icon="['fas', 'bolt']" class="mr:2" />
                Wizard
            </div>
            <div :class="{ active: ui.virtualState('main-panel.tab.active').value === 'settings' }" @click="ui.virtualState('main-panel.tab.active').value = 'settings'" class="tab-head__item">
                <font-awesome-icon :icon="['fas', 'gear']" class="mr:2" />
                Settings
            </div>
            <div class="tab-head__space flex-grow:1 br:hidden!"></div>
        </div>
        <div class="tab-body h:full bg:editor-background overflow:auto!">
            <div class="content-panel h:full">
                <!-- content -->
                <div class="h:full">
                    <KeepAlive>
                        <component :is="panelComponents[ui.virtualState('main-panel.tab.active', 'main.css').value]" />
                    </KeepAlive>
                </div>
            </div>
            <div class="dock-panel">
                <div class="debug-logs"></div>
                <div class="generated-css"></div>
            </div>
        </div>
    </div>
</template>