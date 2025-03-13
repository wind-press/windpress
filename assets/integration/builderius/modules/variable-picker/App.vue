<script setup>
import { inject } from 'vue';
import PanelHeader from './components/PanelHeader.vue';
import PanelBody from './components/PanelBody.vue';

const isOpen = inject('isOpen');
</script>

<template>
  <div
    v-show="isOpen"
    id="windpressbuilderius-variable-app-container"
    class="flex flex:column w:full h:full fg:$(base-2) bg:$(primary-1)"
  >
    <PanelHeader />
    <Suspense>
      <PanelBody />
    </Suspense>
  </div>
</template>
