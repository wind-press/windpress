<script setup>
import { inject, onMounted, ref } from 'vue';
import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
import PanelBody from '@/integration/shared/components/variable-picker/PanelBody.vue';
import { bde, bdeIframe } from '@/integration/breakdance/constant.js';
import { createBuilderConfig } from '@/integration/shared/utils/builder-configs';

const isOpen = inject('isOpen');
const containerRef = ref(null);

const builderConfig = createBuilderConfig({
  appId: 'windpressbreakdance-variable-app',
  storagePrefix: 'windpressbreakdance-variable-app',
  version: windpressbreakdance._version,
  iframe: bdeIframe,
  rootElement: bde,
  hasCustomUnit: true,
  hasThemeDetection: true,
  themeDetectionTarget: 'bde',
});

function updateTheme() {
  if (bde.classList.contains('theme--light')) {
    containerRef.value.classList.add('theme--light');
    containerRef.value.classList.remove('theme--dark');
  } else if (bde.classList.contains('theme--dark')) {
    containerRef.value.classList.add('theme--dark');
    containerRef.value.classList.remove('theme--light');
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      updateTheme();
    }
  });
});

observer.observe(bde, {
  attributes: true,
  attributeFilter: ['class'],
  childList: false,
  subtree: false,
});

onMounted(() => {
  updateTheme();
});
</script>

<template>
  <div v-show="isOpen" id="windpressbreakdance-variable-app-container" ref="containerRef" class="v-application flex flex:column w:full h:full">
    <PanelHeader :builder-config="builderConfig" />
    <Suspense>
      <PanelBody :builder-config="builderConfig" />
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
#windpressbreakdance-variable-app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
