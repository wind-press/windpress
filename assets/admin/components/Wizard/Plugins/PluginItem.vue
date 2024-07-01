<script setup>
import { computed, nextTick, onBeforeMount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useTailwindStore } from '../../../stores/tailwind.js';
import { useBusyStore } from '../../../stores/busy';
import axios from 'axios';
import { debounce } from 'lodash-es';

import VueMultiselect from 'vue-multiselect';

const props = defineProps(['plugin']);

const busyStore = useBusyStore();
const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);

const query = ref('');
const versions = ref([]);
const npmPackages = ref([]);

const multiselect = ref(null);

function asyncFind(search) {
    if (!search || search.length < 1) {
        return;
    }

    busyStore.add('tailwindcss.wizard.plugins.searchPackage');

    axios
        .get('https://registry.npmjs.org/-/v1/search', {
            params: {
                text: search,
            },
        })
        .then((response) => {
            npmPackages.value = response.data.objects.map((item) => {
                return {
                    name: item.package.name,
                    version: item.package.version,
                    path: null,
                };
            });
        })
        .finally(() => {
            busyStore.remove('tailwindcss.wizard.plugins.searchPackage');
        });
}

const debouncedAsyncFind = debounce(asyncFind, 150);

function openSelectEv() {
    nextTick(() => {
        multiselect.value.search = props.plugin.name !== null ? props.plugin.name : query.value;
    });
}

function closeSelectEv() {
    query.value = multiselect.value.search;
}

function fetchVersion() {
    versions.value = [props.plugin.version];

    busyStore.add('tailwindcss.wizard.plugins.fetchVersions');

    axios
        .get(`https://data.jsdelivr.com/v1/package/npm/${props.plugin.name}`)
        .then((response) => {
            versions.value = response.data.versions;
        })
        .finally(() => {
            busyStore.remove('tailwindcss.wizard.plugins.fetchVersions');
        });
}

function deletePlugin(id) {
    if (busyStore.isBusy) {
        return;
    }

    const index = selectedWizard.value.preset.plugins.findIndex((item) => item.id === id);

    if (index !== -1) {
        selectedWizard.value.preset.plugins.splice(index, 1);
    }
}

const currPlugin = computed({
    get: () => props.plugin,
    set: (value) => {
        if (value.name === null || value.name === '') {
            return;
        }
        props.plugin.name = value.name;
        props.plugin.version = value.version;
        props.plugin.path = value.path;

        fetchVersion();
    },
});

onBeforeMount(() => {
    fetchVersion();
});
</script>

<template>
    <div class="plugin-item-drag-handle flex align-items:center cursor:grab opacity:.3">
        <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
    </div>
    <div class="package-name">
        <VueMultiselect ref="multiselect" v-model="currPlugin" :multiple="false" :allow-empty="false" :options="npmPackages" :internal-search="false" :preserve-search="true" @search-change="debouncedAsyncFind" @open="openSelectEv" @close="closeSelectEv" track-by="name" label="name" placeholder="find plugin" deselect-label="" :loading="busyStore.hasTask('tailwindcss.wizard.plugins.searchPackage')" class="{border:1|solid|gray-20;r:4}>.multiselect__tags">
            <template v-slot:noOptions>Start typing to search for a plugin...</template>
        </VueMultiselect>
    </div>
    <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(7rem,2fr)|minmax(3rem,1fr)">
        <select v-model="props.plugin.version" :disabled="!props.plugin.version === null" class="package-version border:1|solid|gray-20 h:full r:4">
            <option v-for="version in versions" :key="version" :value="version">{{ version }}</option>
        </select>
        <input type="text" v-model.lazy="props.plugin.path" class="package-path border:1|solid|gray-20 r:4" placeholder="/rich-color">
        <button @click="deletePlugin(props.plugin.id)" :disabled="props.plugin.version === null" class="button align-items:center bg:red-80/.15 bg:red-80/.3:hover border:0 fg:red-80 float:right ml:0 px:10 r:8 text:center">
            <font-awesome-icon :icon="['fas', 'trash']" class="" />
            Delete
        </button>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>