<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { nanoid } from 'nanoid';
import WizardProfileBar from '../WizardProfileBar.vue';
import { useTailwindStore } from '../../../stores/tailwind';
import ScreenItem from './ScreenItem.vue';

const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);

const newScreen = ref({
    breakpoint: null,
    min: null,
    max: null,
});

function addNewScreen() {
    // if property is not defined, define it
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'screens') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            screens: [],
        };
    }

    selectedWizard.value.preset.screens.push({
        id: nanoid(10),
        breakpoint: newScreen.value.breakpoint,
        min: newScreen.value.min,
        max: newScreen.value.max,
    });

    newScreen.value = {
        breakpoint: null,
        min: null,
        max: null,
    };
}

onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'screens') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            screens: [],
        };
    }
});

</script>

<template>
    <div class="h:full">
        <WizardProfileBar />

        <div class="h:full px:16 py:48">
            <span class="font:28 font:medium">
                Screens
            </span>

            <div class="grid uppercase f:10 fg:gray-90 gap:10 grid-template-columns:minmax(6.25rem,1fr)|minmax(12.5rem,2fr) ls:2px mb:-16 pt:28 px:10">
                <span class="opacity:.5">Screen name</span>
                <span class="opacity:.5 pl:22">Screen width</span>
            </div>

            <div class="grid px:8 py:28">
                <div class="new-screen grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
                    <div class="flex align-items:center opacity:.3">
                        <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
                    </div>
                    <div class="screen-breakpoint">
                        <div class="rel">
                            <label for="screen-breakpoint" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                            <input type="text" v-model="newScreen.breakpoint" name="screen-breakpoint" id="screen-breakpoint" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="laptop">
                        </div>
                    </div>
                    <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(7rem,2fr)|minmax(3rem,1fr)">
                        <div class="rel">
                            <label for="screen-min-width" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Min width</label>
                            <input type="number" v-model="newScreen.min" name="screen-min-width" id="screen-min-width" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="1024">
                            <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                                <span class="font:medium">px</span>
                            </div>
                        </div>
                        <div class="rel">
                            <label for="screen-max-width" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Max width</label>
                            <input type="number" v-model="newScreen.max" name="screen-max-width" id="screen-max-width" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="1279">
                            <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                                <span class="font:medium">px</span>
                            </div>
                        </div>
                        <button @click="addNewScreen" :disabled="!newScreen.breakpoint || (!newScreen.min && !newScreen.max)" class="button align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right ml:0 px:10 r:8 text:center">
                            <font-awesome-icon :icon="['fas', 'plus']" class="" />
                            Add
                        </button>
                    </div>
                </div>

                <Draggable v-model="selectedWizard.preset.screens" tag="transition-group" item-key="id" ghost-class="dragged-placeholder" handle=".screen-item-drag-handle" animation="200">
                    <template #item="{ element }">
                        <div class="screen-item">
                            <ScreenItem :screen="element" />
                        </div>
                    </template>
                </Draggable>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.dragged-placeholder {
    opacity: 0.3;
}
</style>