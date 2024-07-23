<script setup>
import { ref, watch, onMounted } from 'vue';
import PanelHeader from './components/PanelHeader.vue';
import PanelBody from './components/PanelBody.vue';

</script>

<template>
    <div id="windpressbricks-variable-app-container" v-resizable.br="{ minWidth: 300, minHeight: 500 }" class="flex flex:column w:full h:full fg:$(builder-color) bg:$(builder-bg) r:10 overflow:hidden box-shadow:$(builder-box-shadow) outline:1|solid|$(builder-color-accent)">
        <PanelHeader />
        <Suspense>
            <PanelBody />
        </Suspense>
    </div>
</template>

<style lang="scss" scoped>
#windpressbricks-variable-app-container {
    font-size: 16px;
}
</style>