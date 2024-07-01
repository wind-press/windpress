<script setup>
import { watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBusyStore } from '../../../stores/busy';
import { useTailwindStore } from '../../../stores/tailwind';

const props = defineProps(['screen']);

const busyStore = useBusyStore();
const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);
const screensForm = ref(null);

function deleteScreen(id) {
    if (busyStore.isBusy) {
        return;
    }

    const index = selectedWizard.value.preset.screens.findIndex((item) => item.id === id);

    if (index !== -1) {
        selectedWizard.value.preset.screens.splice(index, 1);
    }
}

function checkForm() {
    if (screensForm.value.checkValidity() === false) {
        screensForm.value.reportValidity();
    }

    return;
}

watch([() => props.screen.breakpoint, () => props.screen.min, () => props.screen.max], (newValue, oldValue) => {
    // if the breakpoint is changed, the old breakpoint is empty, and the min and max doesn't change
    if (newValue[0] !== oldValue[0] && oldValue[0] === '' && newValue[1] === oldValue[1] && newValue[2] === oldValue[2]) {
        return;
    }

    // if the min is changed, the old min is empty, and the breakpoint and max doesn't change
    if (newValue[1] !== oldValue[1] && oldValue[1] === '' && newValue[0] === oldValue[0] && newValue[2] === oldValue[2]) {
        return;
    }

    // if the max is changed, the old max is empty, and the breakpoint and min doesn't change
    if (newValue[2] !== oldValue[2] && oldValue[2] === '' && newValue[0] === oldValue[0] && newValue[1] === oldValue[1]) {
        return;
    }

    // trigger submit the form
    screensForm.value.dispatchEvent(new Event('submit'));

    // if breakpoint is empty, return it to the old value
    if (newValue[0] === '') {
        setTimeout(() => {
            if (props.screen.breakpoint === '') {
                props.screen.breakpoint = oldValue[0];
            }
        }, 500);
        return;
    }

    // if the current change is not the breakpoint 
    if (newValue[0] === oldValue[0]) {
        // if the breakpoint is not empty, and the min and max is empty, set the min and max to old value
        if (newValue[1] === '' && newValue[2] === '') {
            props.screen.min = oldValue[1];
            props.screen.max = oldValue[2];
            return;
        }
    }
}, {
    deep: true,
});

</script>

<template>
    <form @submit.prevent="checkForm" ref="screensForm" class="grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
        <div class="screen-item-drag-handle flex align-items:center cursor:grab opacity:.3">
            <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
        </div>
        <div class="screen-breakpoint">
            <div class="rel">
                <label for="screen-breakpoint" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                <input type="text" v-model="props.screen.breakpoint" required name="screen-breakpoint" id="screen-breakpoint" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="laptop">
            </div>
        </div>
        <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(7rem,2fr)|minmax(3rem,1fr)">
            <div class="rel">
                <label for="screen-min-width" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Min width (px)</label>
                <input type="number" v-model="props.screen.min" :required="!props.screen.max" name="screen-min-width" id="screen-min-width" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="1024">
                <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                    <span class="font:medium">px</span>
                </div>
            </div>
            <div class="rel">
                <label for="screen-max-width" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Max width (px)</label>
                <input type="number" v-model="props.screen.max" :required="!props.screen.min" name="screen-max-width" id="screen-max-width" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="1279">
                <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                    <span class="font:medium">px</span>
                </div>
            </div>
            <button type="button" @click="deleteScreen(props.screen.id)" class="button align-items:center bg:red-80/.15 bg:red-80/.3:hover border:0 fg:red-80 float:right ml:0 px:10 r:8 text:center">
                <font-awesome-icon :icon="['fas', 'trash']" class="" />
                Delete
            </button>
        </div>
    </form>
</template>