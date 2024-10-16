<script setup>
import { ref, watch, onMounted, inject } from 'vue';
import Logo from '~/windpress.svg';
import { uni } from '@/integration/builderius/constant.js';

const variableApp = inject('variableApp');
const isOpen = inject('isOpen');

function allowDragPanel() {
    const draggable = variableApp.querySelector('#windpressbuilderius-variable-app-header');
    let isDragging = ref(false);
    let offsetX = 0;
    let offsetY = 0;

    watch(isDragging, (value) => {
        if (!value) {
            document.body.style.removeProperty('user-select');
            uni.style.removeProperty('pointer-events');

            draggable.style.cursor = 'grab';
        } else {
            document.body.style.userSelect = 'none';
            uni.style.pointerEvents = 'none';
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
    <div id="windpressbuilderius-variable-app-header" class="bg:$(primary-1) cursor:grab bb:1|solid|$(primary-3)">
        <div class="flex gap:10 align-items:center fg:$(base-2)">
            <div class="flex  px:12 py:2 align-items:center ">
                <inline-svg :src="Logo" class="inline-svg fill:current font:24" />
            </div>
            <div v-tooltip="{ placement: 'top', content: `v${windpressbuilderius._version}` }" class="text-transform:none font:medium text:center flex-grow:1 gap:10 align-items:center cursor:default px:12 py:2">
                WindPress
            </div>
            <button @click="isOpen = !isOpen" v-tooltip="{ placement: 'top', content: 'Close' }" class="uniPanelIconButton r:0 bg:$(primary-3):hover py:10 px:12">
                <i-fa6-solid-xmark class="iconify fg:$(base-2) font:16" />
            </button>
        </div>
    </div>
</template>
