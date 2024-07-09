<script setup>
import Logo from '~/windpress.svg';
import { useUIStore } from './stores/ui';

import WorkspacePage from './pages/WorkspacePage.vue';

const ui = useUIStore();
</script>

<template>
    <div :class="{'hide-universal': ui.virtualState('window.minimized', false).value}" class="windpress-container my:40 px:40 font:13 h:calc(100vh-80px-var(--wp-admin--admin-bar--height))">
        <WorkspacePage />
    </div>
    <div v-if="windpress.is_universal" :class="{hidden: ui.virtualState('window.minimized', false).value === false}" class="windpress-badge fixed bottom:0 right:0">
        <!-- <div @click="ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value" v-tooltip="{ placement: 'left', distance: 20, content: 'WindPress' }" class="fixed z:calc(infinity) bottom:15 right:15 cursor:pointer:hover fg:black fg:white@dark"> -->
        <div @click="ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value" class="cursor:pointer:hover fg:black fg:white@dark">
            <inline-svg :src="Logo" class="inline-svg fill:current font:28" />
        </div>
    </div>
</template>
