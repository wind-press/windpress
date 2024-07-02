<script setup>
import Logo from '../../../../windpress.svg';
import { useColorMode } from '@vueuse/core';
import { useUIStore } from '../../stores/ui';

const ui = useUIStore();

const theme = useColorMode({
    storageRef: ui.virtualState('window.color-mode', 'light'),
    initialValue: 'light',
    onChanged: (value, defaultHandler) => {
        defaultHandler(value);
        document.documentElement.style.colorScheme = value;
    },
});
</script>

<template>
    <div class="window-header flex flex:row px:12 bb:1|solid|gray-20/.5">
        <div class="window-header__macos py:10 flex flex:row align-items:center gap:6 {b:1;b:solid}>.window-header__macos__button .window-header:not(:hover)_{b:1|solid|gray-20;bg:gray-10}_.window-header__macos__button">
            <div class="window-header__macos__button macos__button-close bg:#ff5f57 b:#de3f37 r:full size:10"></div>
            <div class="window-header__macos__button macos__button-minimize bg:#febc2e b:#de9c0e r:full size:10"></div>
            <div class="window-header__macos__button macos__button-expand bg:#28c840 b:#05a61d r:full size:10"></div>
        </div>
        <div class="window-header__title py:10 flex flex:row align-items:center flex-grow:1 ml:20 gap:6 justify-content:center">
            <inline-svg :src="Logo" class="inline-svg fill:current font:18" />
            <span class="font:16 font:semibold fg:black/.4">WindPress</span>
            <span class="fg:black/.4">{{ windpress._version }}</span>
        </div>
        <div class="flex align-items:center flex:row gap:6">
            <div class="flex align-items:center flex:row gap:2">
                <button @click="theme = theme === 'dark' ? 'light' : 'dark'" class="flex button button-secondary b:0 bg:transparent bg:gray-10:hover fg:gray-90 min-w:36 my:auto width:auto font:16 align-items:center" v-ripple>
                    <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'sun-bright']" class="fill:current" />
                    <font-awesome-icon v-else-if="theme === 'dark'" :icon="['fas', 'moon-stars']" class="fill:current" />
                </button>
            </div>
            <button class="button button-secondary b:transparent b:sky-80:hover" v-ripple>
                Save
            </button>
        </div>
    </div>
</template>