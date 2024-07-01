<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useStorage } from '@vueuse/core';
import { nanoid } from 'nanoid';
import { Switch } from '@headlessui/vue';
import Color from 'https://esm.sh/color';
import { getColors as getShades } from 'https://esm.sh/theme-colors';
import { colors as masterCSSColors } from './MasterCSSColors.js';

import WizardProfileBar from '../WizardProfileBar.vue';
import { useTailwindStore } from '../../../stores/tailwind';
import { useBusyStore } from '../../../stores/busy.js';
import ColorItem from './ColorItem.vue';

const tailwindStore = useTailwindStore();
const busyStore = useBusyStore();

const { selectedWizard } = storeToRefs(tailwindStore);

const newColor = ref({
    key: null,
    value: null,
    shades: {},
    options: {
        enableShades: useStorage('windpress.ui.wizard.colors.generate-shades', true),
    }
});

const currentShades = computed(() => {
    return Object.entries(newColor.value.shades);
});

watch(() => newColor.value.value, (value) => {
    if (newColor.value.options.enableShades === true) {
        try {
            const masterCSSColorShades = Object.entries(masterCSSColors).find(([key, value]) => value['DEFAULT'] === newColor.value.value);
            
            if (masterCSSColorShades) {
                newColor.value.key = masterCSSColorShades[0];
                newColor.value.shades = Object.fromEntries(Object.entries(masterCSSColorShades[1]).filter(([key, value]) => key !== 'DEFAULT'));
                return;
            }
           
            newColor.value.shades = getShades(Color(value).hex());
        } catch (e) {
            newColor.value.shades = {};
        }
    }
});

function addNewColor() {
    // if property is not defined, define it
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'colors') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            colors: [],
        };
    }

    selectedWizard.value.preset.colors.push({
        id: nanoid(10),
        key: newColor.value.key,
        value: newColor.value.value,
        shades: newColor.value.shades,
        options: {
            enableShades: newColor.value.options.enableShades,
        }
    });

    newColor.value = {
        key: null,
        value: null,
        shades: {},
        options: {
            enableShades: useStorage('windpress.ui.wizard.colors.generate-shades', true),
        }
    };
}

onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'colors') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            colors: [],
        };
    }
});
</script>

<template>
    <div class="h:full">
        <WizardProfileBar />

        <div class="h:full px:16 py:48">
            <span class="font:28 font:medium">
                Colors
            </span>

            <div class="grid uppercase f:10 fg:gray-90 gap:10 grid-template-columns:minmax(6.25rem,1fr)|minmax(12.5rem,2fr) ls:2px mb:-16 pt:28 px:10">
                <span class="opacity:.5">Color</span>
                <span class="opacity:.5 pl:22">Shades</span>
            </div>

            <div class="grid px:8 py:28">
                <div class="new-color grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
                    <div class="flex align-items:center opacity:.3">
                        <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
                    </div>
                    <div class="grid gap:8 grid-cols:2">
                        <div class="color-name">
                            <div class="rel">
                                <label for="color-name" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                                <input type="text" v-model="newColor.key" name="color-name" id="color-name" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="primary">
                            </div>
                        </div>
                        <div class="color-value">
                            <div class="rel">
                                <label for="color-value" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8 z:1">Value <span class="fg:crimson-60">*</span></label>
                                <LvColorpicker v-model="newColor.value" :colors="Object.entries(masterCSSColors).map(([key, value]) => value['DEFAULT'])" label="" placeholder="#000000" class="
                                    {abs;p:0;m:0;top:5;right:4}_.lv-input__append
                                    {mx:0;px:8;fg:gray-90;font:14}_.lv-input__element
                                    {rel;px:0;py:0.5;border:1|solid|gray-20;bg:transparent}_.lv-input__field
                                    {shadow:0|0|0|1px|#2271b1}_.lv-input__field:focus-within
                                " />
                            </div>
                        </div>
                    </div>

                    <div class="grid gap:4 grid-template-columns:minmax(7rem,3fr)|minmax(1rem,0.5fr)">
                        <div class="flex flex:row gap:10">
                            <div class="align-self:center">
                                <Switch :aria-disabled="busyStore.isBusy" :checked="newColor.options.enableShades" @click="newColor.options.enableShades = !newColor.options.enableShades" @keyup="e => handleEnableKeyup(e, element)" :class="[newColor.options.enableShades ? 'bg:sky-70' : 'bg:gray-20 opacity:.5']" class="inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44">
                                    <span :class="[newColor.options.enableShades ? 'translateX(20)' : 'translateX(0)']" class="inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" :class="[newColor.options.enableShades ? 'opacity:0 transition-duration:100 transition-timing-function:ease-out' : 'opacity:1 transition-duration:200 transition-timing-function:ease-in']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <font-awesome-icon :icon="['fas', 'xmark']" class="fg:gray-40" />
                                        </span>
                                        <span aria-hidden="true" :class="[newColor.options.enableShades ? 'opacity:1 transition-duration:200 transition-timing-function:ease-in' : 'opacity:0 transition-duration:100 transition-timing-function:ease-out']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <font-awesome-icon :icon="['fas', 'check']" class="fg:sky-70" />
                                        </span>
                                    </span>
                                </Switch>
                            </div>
                            <div v-if="newColor.options.enableShades" class="flex-grow:1">
                                <div class="gap:25|4 grid-cols:11">
                                    <div v-for="[kShade, vShade] in currentShades" :key="kShade">
                                        <div :title="kShade" :class="[`bg:${vShade}`, `fg:${Color(vShade).luminosity() < 0.4 ? Color(newColor.shades[100]).hex() : Color(newColor.shades[900]).hex()}`]" class="center-content flex {hidden}:hover>span:first {block}:hover>span:last font:12 h:40 ls:.5 r:6 w:full">
                                            <span :class="{'font:bold' : vShade.toUpperCase() == Color(newColor.value).hex()}" class="">{{ kShade }}</span>
                                            <span :class="{ 'font:bold': vShade.toUpperCase() == Color(newColor.value).hex() }" class="hidden fg:gray-60 translateY(-30)">{{ vShade }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button @click="addNewColor" :disabled="!newColor.key || !newColor.value" class="button align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right ml:0 px:10 r:8 text:center">
                            <font-awesome-icon :icon="['fas', 'plus']" class="" />
                            Add
                        </button>
                    </div>
                </div>

                <Draggable v-model="selectedWizard.preset.colors" tag="transition-group" item-key="id" ghost-class="dragged-placeholder" handle=".color-item-drag-handle" animation="200">
                    <template #item="{ element }">
                        <div class="color-item">
                            <ColorItem :color="element" />
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

.lv-overlaypanel {
    &.lv-component.--flipped {
        margin-top: -10px;
    }

    .vc-chrome-fields {
        input {
            background-color: transparent;
        }
    }
}
</style>