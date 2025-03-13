<script setup>
import { ref, watch, onMounted, inject } from 'vue';
import Logo from '~/windpress.svg';
import { brx } from '@/integration/bricks/constant.js';

const variableApp = inject('variableApp');
const isOpen = inject('isOpen');

function allowDragPanel() {
    const draggable = variableApp.querySelector('#windpressbricks-variable-app-header');
    let isDragging = ref(false);
    let offsetX = 0;
    let offsetY = 0;

    watch(isDragging, (value) => {
        if (!value) {
            document.body.style.removeProperty('user-select');
            brx.style.removeProperty('pointer-events');

            draggable.style.cursor = 'grab';
        } else {
            document.body.style.userSelect = 'none';
            brx.style.pointerEvents = 'none';
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
  <div
    id="windpressbricks-variable-app-header"
    class="bg:$(builder-bg) cursor:grab bb:1|solid|$(builder-border-color)"
  >
    <div class="flex gap:10 align-items:center">
      <div class="flex align-items:center px:12 py:2">
        <inline-svg
          :src="Logo"
          class="inline-svg fill:current font:24"
        />
      </div>
      <div
        v-tooltip="{ placement: 'top', content: `v${windpressbricks._version}` }"
        class="font:bold gap:10 text:center flex-grow:1 align-items:center cursor:default px:12 py:2"
      >
        WindPress
      </div>
      <button
        v-tooltip="{ placement: 'top', content: 'Close' }"
        class="flex align-items:center py:10 px:12 bg:transparent bg:$(builder-bg-accent):hover"
        @click="isOpen = !isOpen"
      >
        <i-fa6-solid-xmark class="iconify fg:$(builder-color)" />
      </button>
    </div>
  </div>
</template>
