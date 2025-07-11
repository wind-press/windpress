<script setup>
import { inject } from 'vue';
import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
import PanelBody from '@/integration/shared/components/variable-picker/PanelBody.vue';
import { brx, brxIframe } from '@/integration/bricks/constant.js';
import { createBuilderConfig } from '@/integration/shared/utils/builder-configs';

const isOpen = inject('isOpen');

const builderConfig = createBuilderConfig({
  appId: 'windpressbricks-variable-app',
  storagePrefix: 'windpressbricks-variable-app',
  version: windpressbricks._version,
  iframe: brxIframe,
  rootElement: brx,
  hasCustomUnit: false,
  hasThemeDetection: false,
});
</script>

<template>
  <div
    v-show="isOpen"
    id="windpressbricks-variable-app-container"
    class="wp-b-var-container"
  >
    <PanelHeader :builder-config="builderConfig" />
    <Suspense>
      <PanelBody :builder-config="builderConfig" />
    </Suspense>
  </div>
</template>

<style lang="scss" scoped>
.wp-b-var-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: var(--builder-color);
    background-color: var(--builder-bg);
}
</style>