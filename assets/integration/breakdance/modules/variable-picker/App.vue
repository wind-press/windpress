<script setup>
import { inject, onMounted, ref } from 'vue';
import PanelHeader from './components/PanelHeader.vue';
import PanelBody from './components/PanelBody.vue';
import { bde } from '@/integration/breakdance/constant.js';

const isOpen = inject('isOpen');
const containerRef = ref(null);

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
    <div v-show="isOpen" id="windpressbreakdance-variable-app-container" ref="containerRef" v-resizable.br="{ minWidth: 300, minHeight: 500 }" class="v-application flex flex:column w:full h:full  r:10 overflow:hidden outline:1|solid|$(blue200)">
        <PanelHeader />
        <Suspense>
            <PanelBody />
        </Suspense>
    </div>
</template>
