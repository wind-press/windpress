<script setup>
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';

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

const sectionRef = ref(null);

const expand = useStorage(
    `windpressbreakdance-variable-app.ui.expansion-panels.${props.namespace}`,
    { [`${props.name}`]: false },
    undefined,
    { mergeDefaults: true }
);

function togglePanel(val) {
    expand.value[props.name] = val === null ? !expand.value[props.name] : val;
}

function scrollIntoView() {
    sectionRef.value.scrollIntoView();
}

defineExpose({
    togglePanel,
    scrollIntoView
});
</script>

<template>
    <div ref="sectionRef" class="expansion-panel m:10 mr:4">
        <div @click="expand[name] = !expand[name]" :class="{'bg:$(gray300)!' : expand[name]}" class="expansion-panel__header flex bg:$(gray150) bg:$(gray300):hover justify-content:space-between p:10 r:8 cursor:pointer">
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

<style lang="scss" scoped>
.expansion-panel__header {
    line-height: 1.7;
}

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