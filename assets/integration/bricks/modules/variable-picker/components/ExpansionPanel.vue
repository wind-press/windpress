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
    `windpressbricks-variable-app.ui.expansion-panels.${props.namespace}`,
    { [`${props.name}`]: false },
    undefined,
    { mergeDefaults: true }
);
</script>

<template>
    <div class="expansion-panel m:10 mr:4">
        <div @click="expand[name] = !expand[name]" :class="{'bg:$(builder-bg-3)!' : expand[name]}" class="expansion-panel__header flex bg:$(builder-bg-2) bg:$(builder-bg-3):hover justify-content:space-between p:10 r:8 cursor:pointer">
            <div class="flex-grow:1">
                <slot name="header"></slot>
            </div>
            <div>
                <font-awesome-icon :icon="['fas', 'chevron-right']" :class="{ 'rotate(-90)': expand[name] }" class="~duration:300 font:18" />
            </div>
        </div>
        <Transition>
            <div v-if="expand[name]" class="expansion-panel__body">
                <slot></slot>
            </div>
        </Transition>

    </div>
</template>

<style lang="scss">
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>