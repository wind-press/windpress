<script setup>
import { inject } from 'vue';
import PanelHeader from './components/PanelHeader.vue';
import PanelBody from './components/PanelBody.vue';

const isOpen = inject('isOpen');
</script>

<template>
    <div v-show="isOpen" id="windpressbuilderius-variable-app-container" v-resizable.br="{ minWidth: 300, minHeight: 500 }" class="flex flex:column w:full h:full fg:$(base-2) bg:$(primary-1) r:10 overflow:hidden box-shadow:$(builder-box-shadow) outline:1|solid|$(accent-normal)">
        <PanelHeader />
        <Suspense>
            <PanelBody />
        </Suspense>
    </div>
</template>

<style lang="scss" scoped>
</style>