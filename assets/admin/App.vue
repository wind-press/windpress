<script setup>
import { useUIStore } from './stores/ui';

import WorkspacePage from './pages/WorkspacePage.vue';

const ui = useUIStore();
</script>

<template>
    <div :class="{'hide-universal': ui.virtualState('window.minimized', false).value}" class="windpress-container my:40 px:40 font:13 h:calc(100vh-80px-var(--wp-admin--admin-bar--height))">
        <WorkspacePage />
    </div>
    <div :class="{hidden: ui.virtualState('window.minimized', false).value === false}" class="windpress-badge fixed bottom:0 right:0">
        <button @click="ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value">Toggle Minimize</button>
    </div>
</template>
