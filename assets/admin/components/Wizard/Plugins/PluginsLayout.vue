<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { debounce } from 'lodash-es';

import VueMultiselect from 'vue-multiselect';
import { useBusyStore } from '../../../stores/busy.js';
import { useTailwindStore } from '../../../stores/tailwind.js';

import WizardProfileBar from '../WizardProfileBar.vue';
import { storeToRefs } from 'pinia';
import PluginItem from './PluginItem.vue';

const busyStore = useBusyStore();
const tailwindStore = useTailwindStore();

const { selectedWizard } = storeToRefs(tailwindStore);

const multiselect = ref(null);

const query = ref('');
const versions = ref([]);
const npmPackages = ref([]);

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
        multiselect.value.search = newPlugin.value.name !== null ? newPlugin.value.name : query.value;
    });
}

function closeSelectEv() {
    query.value = multiselect.value.search;
}

function removeSelectEv() {
    query.value = '';
    multiselect.value.search = '';
    npmPackages.value = [];
    versions.value = [];

    newPlugin.value = {
        name: null,
        version: null,
        path: null,
    };
}

function fetchVersion() {
    versions.value = [newPlugin.value.version];

    busyStore.add('tailwindcss.wizard.plugins.fetchVersions');

    axios
        .get(`https://data.jsdelivr.com/v1/package/npm/${newPlugin.value.name}`)
        .then((response) => {
            versions.value = response.data.versions;
        })
        .finally(() => {
            busyStore.remove('tailwindcss.wizard.plugins.fetchVersions');
        });
}

const newPlugin = ref({
    name: null,
    version: null,
    path: null,
});

watch(() => newPlugin.value.name, (value) => {
    if (value === null || value === '') {
        return;
    }

    fetchVersion();
});

function addNewPlugin() {
    // if property is not defined, define it
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'plugins') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            plugins: [],
        };
    }

    selectedWizard.value.preset.plugins.push({
        id: nanoid(10),
        name: newPlugin.value.name,
        version: newPlugin.value.version,
        path: newPlugin.value.path,
    });

    newPlugin.value = {
        name: null,
        version: null,
        path: null,
    };
    npmPackages.value = [];
    versions.value = [];
}

onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(selectedWizard.value.preset, 'plugins') === false) {
        selectedWizard.value.preset = {
            ...selectedWizard.value.preset,
            plugins: [],
        };
    }
});
</script>

<template>
    <div class="h:full">
        <WizardProfileBar />

        <div class="h:full px:16 py:48">
            <span class="font:28 font:medium">
                Plugins
            </span>

            <div class="grid uppercase f:10 fg:gray-90 gap:10 grid-template-columns:minmax(6.25rem,1fr)|minmax(12.5rem,2fr) ls:2px mb:-16 pt:28 px:10">
                <span class="opacity:.5">Plugin</span>
                <span class="opacity:.5 pl:22">Version & Path</span>
            </div>

            <div class="grid px:8 py:28">

                <div class="new-plugin grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
                    <div class="flex align-items:center opacity:.3">
                        <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" />
                    </div>
                    <div class="package-name">
                        <VueMultiselect ref="multiselect" v-model="newPlugin" :multiple="false" :options="npmPackages" :internal-search="false" :preserve-search="true" @remove="removeSelectEv" @search-change="debouncedAsyncFind" @open="openSelectEv" @close="closeSelectEv" track-by="name" label="name" placeholder="find plugin" :loading="busyStore.hasTask('tailwindcss.wizard.plugins.searchPackage')" class="{border:1|solid|gray-20;r:4}>.multiselect__tags">
                            <template v-slot:noOptions>Start typing to search for a plugin...</template>
                        </VueMultiselect>
                    </div>
                    <div class="grid gap:20 grid-template-columns:minmax(7rem,2fr)|minmax(7rem,2fr)|minmax(3rem,1fr)">
                        <select v-model="newPlugin.version" :disabled="!newPlugin.version === null" class="package-version border:1|solid|gray-20 h:full r:4">
                            <option v-for="version in versions" :key="version" :value="version">{{ version }}</option>
                        </select>
                        <input type="text" v-model.lazy="newPlugin.path" class="package-path border:1|solid|gray-20 r:4" placeholder="/rich-color">
                        <button @click="addNewPlugin" :disabled="newPlugin.version === null" class="button align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right ml:0 px:10 r:8 text:center">
                            <font-awesome-icon :icon="['fas', 'plus']" class="" />
                            Add
                        </button>
                    </div>
                </div>

                <Draggable v-model="selectedWizard.preset.plugins" tag="transition-group" item-key="id" ghost-class="dragged-placeholder" handle=".plugin-item-drag-handle" animation="200">
                    <template #item="{ element }">
                        <div class="plugin-item grid rel gap:10 grid-template-columns:15px|minmax(6.25rem,1fr)|minmax(12.5rem,2fr) p:12">
                            <PluginItem :plugin="element" />
                        </div>
                    </template>
                </Draggable>
            </div>

        </div>
    </div>
</template>


<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style lang="scss">
.dragged-placeholder {
    opacity: 0.3;
}

.new-plugin,
.plugin-item {

    .package-version,
    .package-path,
    .multiselect__tags {
        border: 1px solid #0000001a;
        border-radius: 8px;
    }

    .package-path::placeholder {
        opacity: 0.3;
    }

    .multiselect,
    .multiselect__tags,
    .multiselect__input,
    .multiselect__single {
        font-size: 12px;
        font-weight: 500;
    }

    .multiselect__placeholder,
    .multiselect__input,
    .multiselect__input:focus {
        padding: 0 0 0 5px;
        margin: 0;
        line-height: 20px;
        min-height: 20px;
    }

    .multiselect__input {
        border-width: 0;

        &:focus {
            box-shadow: none;
        }
    }

    .multiselect__single {
        margin: 0;
    }

    .multiselect__option--highlight,
    .multiselect__option--highlight::after {
        background: #5897fb;
    }

}
</style>