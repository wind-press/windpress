<script setup>
import { inject } from 'vue';
import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
import PanelBody from '@/integration/shared/components/variable-picker/PanelBody.vue';
import { oxyBody, oxyIframe } from '@/integration/oxygen-classic/editor/constant.js';
import { createBuilderConfig } from '@/integration/shared/utils/builder-configs';

const isOpen = inject('isOpen');

const builderConfig = createBuilderConfig({
  appId: 'windpressoxygen-variable-app',
  storagePrefix: 'windpressoxygen-variable-app',
  version: windpressoxygen._version,
  iframe: oxyIframe,
  rootElement: oxyBody,
  hasCustomUnit: true,
  hasThemeDetection: false,
});
</script>

<template>
  <div
    v-show="isOpen"
    id="windpressoxygen-variable-app-container"
  >
    <PanelHeader :builder-config="builderConfig" />
    <Suspense>
      <PanelBody :builder-config="builderConfig" />
    </Suspense>
  </div>
</template>

<style scoped>
#windpressoxygen-variable-app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>

