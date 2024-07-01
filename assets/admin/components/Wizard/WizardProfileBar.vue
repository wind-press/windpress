<script setup>
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { useTailwindStore } from '../../stores/tailwind';

const tailwindStore = useTailwindStore();

const selected = computed({
    get: () => tailwindStore.selectedWizard,
    set: (value) => tailwindStore.selectedWizardId = value.id,
});
</script>

<template>
    <div class="sticky backdrop-filter:blur(10) bg:gray-10/.5 top:0 z:3">
        <div class="px:20">
            <Listbox as="div" v-model="selected" class="flex align-items:center flex:cols gap:10">
                <ListboxLabel class="block fg:gray-90 font:14 font:medium line-height:24px">Profile</ListboxLabel>
                <div class="rel my:8 w:300">
                    <ListboxButton class="rel bg:white border:1|solid|#8c8f94 cursor:default fg:gray-90 pl:12 pr:40 py:6 r:6 text:left w:full">
                        <span class="flex align-items:center font:14">
                            <span v-if="selected" :aria-label="selected.status ? 'Enabled' : 'Disabled'" :class="[selected.status ? 'bg:green-40' : 'bg:gray-10', 'inline-block rounded flex-shrink:0 h:8 w:8']" />
                            <span v-if="selected" class="truncate block ml:12">{{ selected.name }}</span>
                            <span v-else class="truncate block ml:12">
                                Please select a profile
                            </span>
                        </span>
                        <span class="abs flex align-items:center bottom:0 pointer-events:none pr:4 right:0 top:0">
                            <font-awesome-icon :icon="['fas', 'angles-up-down']" class="fg:gray-40 font:14" aria-hidden="true" />
                        </span>
                    </ListboxButton>

                    <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity:100" leave-to-class="opacity:0">
                        <ListboxOptions class="abs bg:white box-shadow:0|10px|15px|-3px|rgb(0|0|0|/|0.1),0|4px|6px|-4px|rgb(0|0|0|/|0.1) font:14 max-h:240 mt:4 overflow:auto py:4 r:6 w:full z:10">
                            <ListboxOption as="template" v-for="wizard in tailwindStore.wizard" :key="wizard.id" :value="wizard" v-slot="{ active, selected }">
                                <li :class="[active ? 'bg:gray-60 fg:white' : 'fg:gray-90', 'rel cursor:default pl:12 pr:36 py:8 user-select:none']">
                                    <div class="flex align-items:center">
                                        <span :class="[wizard.status ? 'bg:green-40' : 'bg:gray-10', 'inline-block rounded flex-shrink:0 h:8 w:8']" aria-hidden="true" />
                                        <span :class="[selected ? 'font:semibold' : 'font:regular', 'truncate block ml:12']">
                                            {{ wizard.name }}
                                            <span class="sr-only"> is {{ wizard.status ? 'enabled' : 'disabled' }}</span>
                                        </span>
                                    </div>

                                    <span v-if="selected" :class="[active ? 'fg:white' : 'fg:green-80', 'abs flex align-items:center bottom:0 pr:16 right:0 top:0']">
                                        <font-awesome-icon :icon="['fas', 'check']" class="font:18" aria-hidden="true" />
                                    </span>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </transition>
                </div>
            </Listbox>
        </div>
    </div>
</template>