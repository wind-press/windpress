<script setup>
import { inject } from 'vue';
import PanelHeader from './components/PanelHeader.vue';
import PanelBody from './components/PanelBody.vue';

const isOpen = inject('isOpen');
</script>

<template>
    <div v-show="isOpen" id="windpressbricks-variable-app-container" class="flex flex:column w:full h:full fg:$(builder-color) bg:$(builder-bg)">
        <PanelHeader />
        <Suspense>
            <PanelBody />
        </Suspense>
    </div>
</template>

<style lang="scss" scoped>
#windpressbricks-variable-app-container {
    // font-size: 16px;
}
</style>