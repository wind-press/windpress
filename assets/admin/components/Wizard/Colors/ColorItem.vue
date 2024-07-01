<script setup>
import { watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Color from 'color';
import { getColors as getShades } from 'theme-colors';
import { useBusyStore } from '../../../stores/busy';
import { useTailwindStore } from '../../../stores/tailwind';
import { Switch } from '@headlessui/vue';
import { colors as masterCSSColors } from './MasterCSSColors.js';

const props = defineProps(['color']);

const busyStore = useBusyStore();
const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);
const colorsForm = ref(null);

function deleteColor(id) {
    if (busyStore.isBusy) {
        return;
    }

    const index = selectedWizard.value.preset.colors.findIndex((item) => item.id === id);

    if (index !== -1) {
        selectedWizard.value.preset.colors.splice(index, 1);
    }
}

function checkForm() {
    if (colorsForm.value.checkValidity() === false) {
        colorsForm.value.reportValidity();
    }

    return;
}

watch(() => props.color.value, (value) => {
    if (props.color.options.enableShades === true) {
        try {
            const masterCSSColorShades = Object.entries(masterCSSColors).find(([key, value]) => value['DEFAULT'] === props.color.value);
            
            if (masterCSSColorShades) {
                props.color.shades = Object.fromEntries(Object.entries(masterCSSColorShades[1]).filter(([key, value]) => key !== 'DEFAULT'));
                return;
            }

            props.color.shades = getShades(Color(value).hex());
        } catch (e) {
            props.color.shades = {};
        }
    }
});

watch([() => props.color.key, () => props.color.value], (newValue, oldValue) => {
    // trigger submit the form
    colorsForm.value.dispatchEvent(new Event('submit'));

    if (newValue[0] === '') {
        setTimeout(() => {
            if (props.color.key === '') {
                props.color.key = oldValue[0];
            }
        }, 500);
        return;
    }

    if (newValue[1] === '') {
        setTimeout(() => {
            if (props.color.value === '') {
                props.color.value = oldValue[1];
            }
        }, 500);
        return;
    }
}, {
    deep: true,
});

</script>

<template>
    <form @submit.prevent="checkForm" ref="colorsForm" class="grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
        <div class="color-item-drag-handle flex align-items:center cursor:grab opacity:.3">
            <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
        </div>
        <div class="grid gap:8 grid-cols:2">
            <div class="color-name">
                <div class="rel">
                    <label for="color-name" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                    <input type="text" v-model="props.color.key" name="color-name" id="color-name" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder py:6 r:6 w:full" placeholder="primary">
                </div>
            </div>
            <div class="color-value">
                <div class="rel">
                    <label for="color-value" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8 z:1">Value <span class="fg:crimson-60">*</span></label>
                    <LvColorpicker v-model="props.color.value" :colors="Object.entries(masterCSSColors).map(([key, value]) => value['DEFAULT'])" label="" placeholder="#000000" class="
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
                    <Switch :aria-disabled="busyStore.isBusy" :checked="props.color.options.enableShades" @click="props.color.options.enableShades = !props.color.options.enableShades" @keyup="e => handleEnableKeyup(e, element)" :class="[props.color.options.enableShades ? 'bg:sky-70' : 'bg:gray-15 opacity:.5']" class="inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44">
                        <span :class="[props.color.options.enableShades ? 'translateX(20)' : 'translateX(0)']" class="inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                            <span aria-hidden="true" :class="[props.color.options.enableShades ? 'opacity:0 transition-duration:100 transition-timing-function:ease-out' : 'opacity:1 transition-duration:200 transition-timing-function:ease-in']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                <font-awesome-icon :icon="['fas', 'xmark']" class="fg:gray-40" />
                            </span>
                            <span aria-hidden="true" :class="[props.color.options.enableShades ? 'opacity:1 transition-duration:200 transition-timing-function:ease-in' : 'opacity:0 transition-duration:100 transition-timing-function:ease-out']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                <font-awesome-icon :icon="['fas', 'check']" class="fg:sky-70" />
                            </span>
                        </span>
                    </Switch>
                </div>
                <div v-if="props.color.options.enableShades" class="flex-grow:1">
                    <div class="gap:25|4 grid-cols:11">
                        <div v-for="[kShade, vShade] in Object.entries(props.color.shades)" :key="kShade">
                            <div :title="kShade" :class="[`bg:${vShade}`, `fg:${Color(vShade).luminosity() < 0.4 ? Color(props.color.shades[100]).hex() : Color(props.color.shades[900]).hex()}`]" class="center-content flex {hidden}:hover>span:first {block}:hover>span:last font:12 h:40 ls:.5 r:6 w:full">
                                <span :class="{ 'font:bold': vShade.toUpperCase() == Color(props.color.value).hex() }" class="">{{ kShade }}</span>
                                <span :class="{ 'font:bold': vShade.toUpperCase() == Color(props.color.value).hex() }" class="hidden fg:gray-60 translateY(-30)">{{ vShade }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button type="button" @click="deleteColor(props.color.id)" class="button align-items:center bg:red-80/.15 bg:red-80/.3:hover border:0 fg:red-80 float:right ml:0 px:10 r:8 text:center">
                <font-awesome-icon :icon="['fas', 'trash']" class="" />
                Delete
            </button>
        </div>
    </form>
</template>