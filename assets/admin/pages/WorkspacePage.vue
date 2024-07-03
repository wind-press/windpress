<script setup>
import WindowHeader from '../components/Workspace/WindowHeader.vue';
import Sidebar from '../components/Workspace/Sidebar.vue';
import MainPanel from '../components/Workspace/MainPanel.vue';
import StatusBar from '../components/Workspace/StatusBar.vue';
import { useUIStore } from '../stores/ui.js';

const ui = useUIStore();
</script>

<template>
    <div :class="[ui.virtualState('window.color-mode', 'light').value === 'light' ? 'light' : 'dark']" class="r:12 h:full b:1|solid|gray-70/.2 b:gray-20/.2@dark box-shadow:0|2px|5px|rgba(0,0,0,.051) overflow:hidden">
        <div class="workspace-container flex flex:column h:full">
            <WindowHeader />

            <div class="window-body w:full flex flex:row flex-grow:1">
                <Sidebar />
                <MainPanel />
            </div>

            <StatusBar />
        </div>
    </div>
</template>