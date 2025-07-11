<script setup>
import { inject } from 'vue';
import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
import PanelBody from '@/integration/shared/components/variable-picker/PanelBody.vue';
import { uni, uniIframe } from '@/integration/builderius/constant.js';
import { createBuilderConfig } from '@/integration/shared/utils/builder-configs';

const isOpen = inject('isOpen');

const builderConfig = createBuilderConfig({
  appId: 'windpressbuilderius-variable-app',
  storagePrefix: 'windpressbuilderius-variable-app',
  version: windpressbuilderius._version,
  iframe: uniIframe,
  rootElement: uni,
  hasCustomUnit: false,
  hasThemeDetection: false,
});
</script>

<template>
  <div v-show="isOpen" id="windpressbuilderius-variable-app-container" class="flex flex:column w:full h:full fg:$(base-2) bg:$(primary-1)">
    <PanelHeader :builder-config="builderConfig" />
    <Suspense>
      <PanelBody :builder-config="builderConfig" />
    </Suspense>
  </div>
</template>

<style scoped>
#windpressbuilderius-variable-app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--base-2);
  background-color: var(--primary-1);
}
</style>
