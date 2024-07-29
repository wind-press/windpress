<script setup>
import { ref, watch, onMounted, inject } from 'vue';
import Logo from '~/windpress.svg';
import { bde } from '@/integration/breakdance/constant.js';

const variableApp = inject('variableApp');
const isOpen = inject('isOpen');

function allowDragPanel() {
    const draggable = variableApp.querySelector('#windpressbreakdance-variable-app-header');
    let isDragging = ref(false);
    let offsetX = 0;
    let offsetY = 0;

    watch(isDragging, (value) => {
        if (!value) {
            document.body.style.removeProperty('user-select');
            bde.querySelector('div.v-application--wrap').style.removeProperty('pointer-events');

            draggable.style.cursor = 'grab';
        } else {
            document.body.style.userSelect = 'none';
            bde.querySelector('div.v-application--wrap').style.pointerEvents = 'none';
            draggable.style.cursor = 'grabbing';
        }
    });

    const handleDragStart = (e) => {
        isDragging.value = true;
        const rect = draggable.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    };

    draggable.removeEventListener('mousedown', handleDragStart);
    draggable.addEventListener('mousedown', handleDragStart);

    const handleDrag = (e) => {
        if (!isDragging.value) {
            return;
        }
        const rect = draggable.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        const x = clientX - offsetX;
        const y = clientY - offsetY;
        const posX = (x < 0 ? 0 : x > window.innerWidth - rect.width ? window.innerWidth - rect.width : x);
        const posY = y < 0 ? 0 : y > window.innerHeight - rect.height ? window.innerHeight - rect.height : y;
        variableApp.style.left = `${posX}px`;
        variableApp.style.top = `${posY}px`;
    };
    document.removeEventListener('mousemove', handleDrag);
    document.addEventListener('mousemove', handleDrag);
    const endDragging = (e) => {
        isDragging.value = false;
    };
    document.removeEventListener('mouseup', endDragging);
    document.addEventListener('mouseup', endDragging);
}

onMounted(() => {
    allowDragPanel();
});
</script>

<template>
    <div id="windpressbreakdance-variable-app-header" class=" cursor:grab bb:1|solid|$(gray200)">
        <div class="flex gap:10 align-items:center px:12 py:10 fg:$(bdedark)">
            <a :href="windpressbreakdance.site_meta.admin_url" target="_blank" v-tooltip="{ placement: 'top', content: 'Open WindPress plugin' }" class="flex align-items:center fg:$(bdedark) fg:$(blue600):hover">
                <inline-svg :src="Logo" class="inline-svg fill:current font:24" />
            </a>
            <div v-tooltip="{ placement: 'top', content: `v${windpressbreakdance._version}` }" class="text-transform:none font:medium flex gap:10 align-items:center cursor:default">
                WindPress
            </div>
            <button @click="isOpen = !isOpen" v-tooltip="{ placement: 'top', content: 'Close' }" class="ml:auto py:4 px:8 r:4 fg:$(blue600):hover bg:$(blue50):hover">
                <font-awesome-icon :icon="['fas', 'xmark']" class=" font:16" />
            </button>
        </div>
    </div>
</template>
