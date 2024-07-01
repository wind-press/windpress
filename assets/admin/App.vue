<script setup>
import { ref, computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { useBusyStore } from './stores/busy.js';
import WorkspacePage from './pages/WorkspacePage.vue';

import Logo from '../../windpress.svg';

const busyStore = useBusyStore();

const theme = useColorMode({
    storageKey: 'theme',
    initialValue: 'light',
    onChanged: (value, defaultHandler) => {
        defaultHandler(value);
        document.documentElement.style.colorScheme = value;
    },
});
</script>

<template>
    <div>
        <div class="windpress-main rel flex flex flex:column">
            <header id="windpress-header" class="flex sticky align-items:center bg:white px:20 py:6 z:12">
                <div class="flex align-items:center fg:black!_* flex-grow:1 gap:10">
                    <inline-svg :src="Logo" class="inline-svg f:40 fill:current px:2" />
                    <h1 class="">WindPress</h1>
                </div>
                <div class="">
                    <div class="flex align-items:center flex:row gap:10">
                        <button @click="theme = theme === 'dark' ? 'light' : 'dark'" class="flex rounded b:0 bg:transparent bg:#f3f4f6:hover cursor:pointer f:20 fg:black p:10">
                            <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'sun-bright']" class="fill:current" />
                            <font-awesome-icon v-else-if="theme === 'dark'" :icon="['fas', 'moon-stars']" class="fill:current" />
                        </button>

                        <VDropdown :distance="12">
                            <button class="button button-secondary b:0 bg:transparent bg:gray-10:hover fg:gray-90 h:36 min-w:36 my:auto width:auto">
                                <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" class="font:15" />
                            </button>

                            <template #popper>
                                <div>
                                    <div role="group" class="flex flex:column font:14 min-w:120 p:4 w:auto">
                                        <a href="https://wind.press/docs?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=pro-version" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                            <font-awesome-icon :icon="['fas', 'book']" class="min-w:14" />
                                            Documentation
                                        </a>
                                        <a href="https://rosua.org/support-portal" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                            <font-awesome-icon :icon="['fas', 'user-headset']" class="min-w:14" />
                                            Support
                                        </a>
                                        <a href="https://www.facebook.com/groups/1142662969627943" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                            <font-awesome-icon :icon="['fab', 'facebook']" class="min-w:14" />
                                            Community
                                        </a>
                                    </div>
                                </div>
                            </template>
                        </VDropdown>
                    </div>
                </div>
            </header>

            <div class="flex flex:column flex-grow:1 w:full mx:auto p:0">
                <div class="windpress-content flex-grow:1 my:40 px:40">
                    <WorkspacePage />
                </div>
            </div>
        </div>
    </div>
</template>