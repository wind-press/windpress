<script setup>
import { ref, watch } from 'vue';
import { useStorage, useResizeObserver } from '@vueuse/core';

const props = defineProps({
    namespace: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

const expand = useStorage(
    `windpress.ui.expansion-panels.${props.namespace}`,
    { [`${props.name}`]: false },
    undefined,
    { mergeDefaults: true }
);

const bodyEl = ref(null);

function toggle(val) {
    if (!bodyEl.value) {
        return;
    }

    bodyEl.value.style.maxHeight = val ? bodyEl.value.scrollHeight + 'px' : null;
}

watch(bodyEl, () => {
    setTimeout(() => {
        toggle(expand.value[props.name]);
    }, 200);
});

useResizeObserver(bodyEl, () => {
    if (expand.value[props.name]) {
        toggle(expand.value[props.name]);
    }
});

watch(() => expand.value[props.name], (val) => {
    toggle(val);
}, { deep: true, });
</script>

<template>
    <div class="expansion-panel box-shadow:0|2px|5px|rgba(0,0,0,.051)">
        <div class="expansion-panel__header flex bb:1|solid|#e8e8eb bg:white justify-content:space-between px:24 py:16">
            <div class="flex-grow:1">
                <slot name="header"></slot>
            </div>
            <div @click="expand[name] = !expand[name]" class="cursor:pointer ">
                <font-awesome-icon :icon="['fas', 'chevron-right']" :class="{ 'rotate(-90)': expand[name] }" class="~duration:300 font:18" />
            </div>
        </div>
        <div ref="bodyEl" :class="{ 'overflow:hidden': !expand[name] }" class="expansion-panel__body max-h:0 transition:max-height|0.2s|ease-out">
            <slot></slot>
        </div>
        <div class="expansion-panel__footer">
            <div>
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>
