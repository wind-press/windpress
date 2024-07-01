<script setup>
import { watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBusyStore } from '../../../stores/busy';
import { useTailwindStore } from '../../../stores/tailwind';

const props = defineProps(['typography']);

const busyStore = useBusyStore();
const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);
const typographyForm = ref(null);

function deleteSpacing(id) {
    if (busyStore.isBusy) {
        return;
    }

    const index = selectedWizard.value.preset.typography.findIndex((item) => item.id === id);

    if (index !== -1) {
        selectedWizard.value.preset.typography.splice(index, 1);
    }
}

function checkForm() {
    if (typographyForm.value.checkValidity() === false) {
        typographyForm.value.reportValidity();
    }

    return;
}

watch([() => props.typography.key, () => props.typography.value], (newValue, oldValue) => {
    // if the key is changed, the old key is empty, and the value doesn't change
    if (newValue[0] !== oldValue[0] && oldValue[0] === '' && newValue[1] === oldValue[1]) {
        return;
    }

    // if the value is changed, the old value is empty, and the key and max doesn't change
    if (newValue[1] !== oldValue[1] && oldValue[1] === '' && newValue[0] === oldValue[0]) {
        return;
    }

    // trigger submit the form
    typographyForm.value.dispatchEvent(new Event('submit'));

    // if key is empty, return it to the old value
    if (newValue[0] === '') {
        setTimeout(() => {
            if (props.typography.key === '') {
                props.typography.key = oldValue[0];
            }
        }, 500);
        return;
    }

    // if the current change is the value 
    if (newValue[1] === '') {
        props.typography.value = oldValue[1];
        return;
    }
}, {
    deep: true,
});

</script>

<template>
    <form @submit.prevent="checkForm" ref="typographyForm" class="grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
        <div class="typography-item-drag-handle flex align-items:center cursor:grab opacity:.3">
            <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
        </div>
        <div class="typography-key">
            <div class="rel">
                <label for="typography-key" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Name <span class="fg:crimson-60">*</span></label>
                <input type="text" v-model="props.typography.key" required name="typography-key" id="typography-key" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="lg">
            </div>
        </div>
        <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(3rem,1fr)">
            <div class="rel">
                <label for="typography-value" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Size <span class="fg:crimson-60">*</span></label>
                <input type="text" v-model="props.typography.value" :required="!props.typography.max" name="typography-value" id="typography-value" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="1024">
            </div>
            <button type="button" @click="deleteSpacing(props.typography.id)" class="button align-items:center bg:red-80/.15 bg:red-80/.3:hover border:0 fg:red-80 float:right ml:0 px:10 r:8 text:center">
                <font-awesome-icon :icon="['fas', 'trash']" class="" />
                Delete
            </button>
        </div>
    </form>
</template>