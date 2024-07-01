<script setup>
import { Switch } from '@headlessui/vue';

import { useBusyStore } from '../../../stores/busy.js';
import { useTailwindStore } from '../../../stores/tailwind.js';
import { useNotifier } from '../../../library/notifier.js';
import { ref } from 'vue';
import { nanoid } from 'nanoid';

const busy = useBusyStore();
const tailwindStore = useTailwindStore();
const notifier = useNotifier();

const newId = ref(nanoid(10));
const newName = ref('Default Profile');

function handleEnableKeyup(e, item) {
    if (e.code === 'Space') {
        e.preventDefault();
        item.status = !item.status;
    }
}

function addNewProfile() {
    if (busy.isBusy) {
        return;
    }

    if (newName.value.trim() === '') {
        notifier.alert('Profile name cannot be empty.');
        return;
    }

    tailwindStore.wizard.push({
        id: newId.value,
        name: newName.value,
        status: true,
        preset: {}
    });

    newId.value = nanoid(10);
    newName.value = 'Default Profile';
}

function deleteProfile(id) {
    if (busy.isBusy) {
        return;
    }

    if (tailwindStore.wizard.length < 2) {
        notifier.alert('You need at least one profile.');
        return;
    }

    if (!confirm('Are you sure you want to delete this profile?')) {
        return;
    }

    const index = tailwindStore.wizard.findIndex((item) => item.id === id);
    if (index !== -1) {
        tailwindStore.wizard.splice(index, 1);
    }
}

function handleIdChange(e, item) {
    const value = e.target.value.trim();
    if (value === '') {
        notifier.alert('Profile id cannot be empty. Reverting to previous value...');
        e.target.value = item.id;
        return;
    }

    const index = tailwindStore.wizard.findIndex((item) => item.id === value);
    if (index !== -1) {
        notifier.alert('Profile id must be unique. Reverting to previous value...');
        e.target.value = item.id;
        return;
    }

    item.id = value;
}
</script>

<template>
    <div class="h:full">
        <div class="h:full px:16 py:48">
            <span class="font:28 font:medium">
                Profiles
            </span>

            <div class="grid gap:24 grid-template-columns:repeat(auto-fit,minmax(20rem,1fr)) px:8 py:28">
                <div class="flex align-items:center b:1|solid|gray-20 flex:row r:8">
                    <div class="grid align-content:center flex-grow:1 gap:20 grid-auto-flow:row justify-items:center">
                        <span class="font:18 font:semibold">Create a new profile</span>
                        <div class="grid gap:12 grid-auto-flow:column">
                            <input type="text" v-model.lazy.trim="newName" placeholder="Default Profile" class="b:1|solid|gray-20 r:4">
                            <button @click="addNewProfile" class="button flex align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right gap-x:4 ml:0 px:10 r:8">Create</button>
                        </div>
                    </div>
                </div>

                <Draggable v-model="tailwindStore.wizard" tag="transition-group" item-key="id" ghost-class="dragged-placeholder" handle=".profile-item-drag-handle" animation="200">
                    <template #item="{ element }">
                        <div>
                            <div class="flex rel b:1|solid|gray-20 flex:col r:8">
                                <div class="abs left:-1.1% top:48%">
                                    <font-awesome-icon :icon="['fas', 'grip-dots-vertical']" class="profile-item-drag-handle cursor:grab font:20 opacity:.3" />
                                </div>
                                <div class="flex bb:1|solid|gray-20 p:24">
                                    <div class="flex flex:col gap:6">
                                        <input type="text" class="b:1|solid|gray-20:hover border:transparent fg:gray-80 font:18 font:semibold" placeholder="Default" v-model.lazy.trim="element.name">
                                        <div class="fg:gray-50 font:14">
                                            <span class="font:bold pl:10">ID:</span> <input type="text" :value="element.id" @change="e => handleIdChange(e, element)" class="b:1|solid|gray-20:hover border:transparent fg:inherit" placeholder="profile's id" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex align-items:center gap:8 p:14">
                                    <Switch :aria-disabled="busy.isBusy" :checked="element.status" @click="element.status = !element.status" @keyup="e => handleEnableKeyup(e, element)" :class="[element.status ? 'bg:sky-70' : 'bg:gray-20 opacity:.5']" class="transition-timing-function:cubic-bezier(0.4,0,0.2,1) inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke w:44">
                                        <span :class="[element.status ? 'translateX(20)' : 'translateX(0)']" class="transition-timing-function:cubic-bezier(0.4,0,0.2,1) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter w:20">
                                            <span aria-hidden="true" :class="[element.status ? 'transition-timing-function:ease-out opacity:0 transition-duration:100' : 'transition-timing-function:ease-in opacity:1 transition-duration:200']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                                <font-awesome-icon v-if="!element.isUpdatingStatus" :icon="['fas', 'xmark']" class="fg:gray-40" />
                                                <font-awesome-icon v-else :icon="['fas', 'spinner']" class="animation:rotate|linear|1s|infinite fg:gray-40" />
                                            </span>
                                            <span aria-hidden="true" :class="[element.status ? 'transition-timing-function:ease-in opacity:1 transition-duration:200' : 'transition-timing-function:ease-out opacity:0 transition-duration:100']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                                <font-awesome-icon v-if="!element.isUpdatingStatus" :icon="['fas', 'check']" class="fg:sky-70" />
                                                <font-awesome-icon v-else :icon="['fas', 'spinner']" class="animation:rotate|linear|1s|infinite fg:sky-70" />
                                            </span>
                                        </span>
                                    </Switch>
                                    <div class="flex-grow:1"></div>
                                    <button disabled class="button flex align-items:center bg:sky-80/.15 bg:sky-80/.3:hover border:0 fg:sky-80 float:right gap-x:4 ml:0 px:10 r:8">
                                        <font-awesome-icon :icon="['fas', 'download']" class="" />
                                        Export
                                    </button>
                                    <button class="button flex align-items:center bg:red-80/.15 bg:red-80/.3:hover border:0 fg:red-80 float:right gap-x:4 ml:0 px:10 r:8" @click="deleteProfile(element.id)">
                                        <font-awesome-icon :icon="['fas', 'trash']" class="" />
                                        Delete
                                    </button>
                                </div>
                            </div>
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