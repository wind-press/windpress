<script setup>
import WindowHeader from '../components/Workspace/WindowHeader.vue';
import Sidebar from '../components/Workspace/Sidebar.vue';
import MainPanel from '../components/Workspace/MainPanel.vue';
</script>

<template>
    <div class="r:12 bg:gray-5 h:full b:1|solid|gray-70/.2 box-shadow:0|2px|5px|rgba(0,0,0,.051)">
        <div class="workspace-container flex flex:column h:full">
            <WindowHeader />

            <div class="window-body w:full flex flex:row flex-grow:1 bb:1|solid|gray-20/.5 {bl:1|solid|gray-20/.5}>*+*">
                <Sidebar />
                <MainPanel />
            </div>

            <div class="status-bar flex">
                <div>STATUS BAR</div>
            </div>
        </div>
    </div>
</template>