<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { nanoid } from 'nanoid';
import WizardProfileBar from '../WizardProfileBar.vue';
import { useTailwindStore } from '../../../stores/tailwind';
import TypographyItem from './TypographyItem.vue';
import FluidCalculator from '../FluidCalculator.vue';

const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);

const newTypography = ref({
    key: null,
    value: null,
});

function addNewTypography() {
    // if plugin property is not defined, define it
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'typography') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            typography: [],
        };
    }

    selectedWizard.value.preset.typography.push({
        id: nanoid(10),
        key: newTypography.value.key,
        value: newTypography.value.value,
    });

    newTypography.value = {
        key: null,
        value: null,
    };
}

function calcFluid(minSize, maxSize, minWidth, maxWidth) {
    // Calculate the slope
    const slope = (maxSize - minSize) / (maxWidth - minWidth);

    // Calculate the y-intersection
    const yIntersection = (-1 * minWidth) * slope + minSize;

    // Return the clamp CSS
    return `clamp(${parseFloat((minSize/16).toFixed(4).toString())}rem, ${parseFloat((yIntersection/16).toFixed(4).toString())}rem + ${parseFloat((slope * 100).toFixed(4).toString())}vw, ${parseFloat((maxSize/16).toFixed(4).toString())}rem)`;
}

function generateFluidTypography(config) {
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'typography') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            typography: [],
        };
    }

    for (let i = 1; i <= config.stepsSmaller; i++) {
        let key = config.miscPrefix || '';
        if (i === config.stepsSmaller) {
            key += 'sm';
        } else if (i === config.stepsSmaller - 1) {
            key += 'xs';
        } else {
            key += `${config.stepsSmaller - i}xs`;
        }

        let currentMinSize = config.minSize;
        let currentMaxSize = config.maxSize;

        for (let j = 0; j < config.stepsSmaller + 1 - i; j++) {
            currentMinSize /= config.minScale;
            currentMaxSize /= config.maxScale;
        }

        selectedWizard.value.preset.typography.push({
            id: nanoid(10),
            key: key,
            value: calcFluid(currentMinSize, currentMaxSize, config.minViewport, config.maxViewport),
        });
    }

    selectedWizard.value.preset.typography.push({
        id: nanoid(10),
        key: (config.miscPrefix || '') + 'base',
        value: calcFluid(config.minSize, config.maxSize, config.minViewport, config.maxViewport),
    });

    for (let i = 1; i <= config.stepsLarger; i++) {
        let key = config.miscPrefix || '';
        if (i === 1) {
            key += 'lg';
        } else if (i === 2) {
            key += 'xl';
        } else {
            key += `${i-1}xl`;
        }

        let currentMinSize = config.minSize;
        let currentMaxSize = config.maxSize;
        for (let j = 0; j < i; j++) {
            currentMinSize *= config.minScale;
            currentMaxSize *= config.maxScale;
        }

        selectedWizard.value.preset.typography.push({
            id: nanoid(10),
            key: key,
            value: calcFluid(currentMinSize, currentMaxSize, config.minViewport, config.maxViewport),
        });
    }
}

onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'typography') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            typography: [],
        };
    }
});
</script>

<template>
    <div class="h:full">
        <WizardProfileBar />

        <div class="px:16 py:48">
            <span class="font:28 font:medium">
                Typography
            </span>

            <div class="grid grid-template-cols:1fr|0.5fr">
                <div>
                    <div class="grid uppercase f:10 fg:gray-90 gap:10 grid-template-columns:minmax(6.25rem,1fr)|minmax(12.5rem,2fr) ls:2px mb:-16 pt:28 px:10">
                        <span class="opacity:.5">Typography name</span>
                        <span class="opacity:.5 pl:22">Typography Size</span>
                    </div>

                    <div class="grid px:8 py:28">
                        <div class="new-typography grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
                            <div class="flex align-items:center opacity:.3">
                                <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
                            </div>
                            <div class="typography-key">
                                <div class="rel">
                                    <label for="typography-key" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                                    <input type="text" v-model="newTypography.key" name="typography-key" id="typography-key" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="lg">
                                </div>
                            </div>
                            <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(3rem,1fr)">
                                <div class="rel">
                                    <label for="typography-value" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Size <span class="fg:crimson-60">*</span></label>
                                    <input type="text" v-model="newTypography.value" name="typography-value" id="typography-value" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="16px">
                                </div>
                                <button @click="addNewTypography" :disabled="!newTypography.key || !newTypography.value" class="button align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right ml:0 px:10 r:8 text:center">
                                    <font-awesome-icon :icon="['fas', 'plus']" class="" />
                                    Add
                                </button>
                            </div>
                        </div>

                        <Draggable v-model="selectedWizard.preset.typography" tag="transition-group" item-key="id" ghost-class="dragged-placeholder" handle=".typography-item-drag-handle" animation="200">
                            <template #item="{ element }">
                                <div class="typography-item">
                                    <TypographyItem :typography="element" />
                                </div>
                            </template>
                        </Draggable>
                    </div>
                </div>

                <FluidCalculator @calculate="generateFluidTypography" />
            </div>

        </div>
    </div>
</template>

<style lang="scss">
.dragged-placeholder {
    opacity: 0.3;
}
</style>