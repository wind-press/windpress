<script setup>
import WindowHeader from '@/dashboard/components/Workspace/WindowHeader.vue';
import Sidebar from '@/dashboard/components/Workspace/Sidebar.vue';
import MainPanel from '@/dashboard/components/Workspace/MainPanel.vue';
import StatusBar from '@/dashboard/components/Workspace/StatusBar.vue';
</script>

<template>
    <div class="r:12 h:full max-h:calc(100vh-80px-var(--wp-admin--admin-bar--height)) b:1|solid|gray-70/.2 b:gray-20/.2@dark box-shadow:0|2px|5px|rgba(0,0,0,.051) overflow:hidden">
        <div class="workspace-container flex flex:column h:full">
            <WindowHeader />

            <div class="window-body w:full h:0 flex flex:row flex-grow:1">
                <Sidebar />
                <MainPanel />
            </div>

            <StatusBar />
        </div>
    </div>
</template>