<script setup>
import Logo from '~/windpress.svg';
import { useColorMode } from '@vueuse/core';
import { useUIStore } from '@/dashboard/stores/ui';

const ui = useUIStore();

const theme = useColorMode({
    storageRef: ui.virtualState('window.color-mode', 'light'),
    initialValue: 'light',
    onChanged: (value, defaultHandler) => {
        defaultHandler(value);

        if (document.querySelector('#windpress-app.universal') === null) {
            document.documentElement.style.colorScheme = value;
        }
    },
});

function toggleMinimize() {
    ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value;
}

const channel = new BroadcastChannel('windpress');

function doSave() {
    channel.postMessage({
        source: 'windpress/dashboard',
        target: 'windpress/dashboard',
        task: 'windpress.save',
    });
}
</script>

<template>
    <div class="window-header flex flex:row px:12 bb:1|solid|titleBar-border bg:#f8f8f8 bg:#1f1f1f@dark">
        <div class="window-header__macos py:10 flex flex:row align-items:center gap:6 {b:1|solid|gray-20;bg:gray-10}>.macos__button {b:1|solid|gray-20;bg:gray-10}_.macos__button {b:gray-60;bg:gray-70}_.macos__button@dark">
            <div class="macos__button close r:full size:10"></div>
            <div @click="toggleMinimize" class="macos__button minimize r:full size:10 cursor:pointer"></div>
            <div class="macos__button expand r:full size:10"></div>
        </div>
        <div class="window-header__title py:10 flex flex:row align-items:center flex-grow:1 ml:20 gap:6 justify-content:center fg:foreground">
            <inline-svg :src="Logo" class="inline-svg fill:current font:18" />
            <span class="font:16 font:semibold">WindPress</span>
            <span class="fg:foreground/.4">{{ windpress._version }}</span>
        </div>
        <div class="flex align-items:center flex:row gap:6">
            <div class="flex align-items:center flex:row gap:2">
                <button @click="theme = theme === 'dark' ? 'light' : 'dark'" class="flex button button-secondary b:0! bg:transparent! bg:button-secondaryHoverBackground!:hover fg:foreground! min-w:36 my:auto width:auto font:16 align-items:center" v-ripple>
                    <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'sun-bright']" class="fill:current!" />
                    <font-awesome-icon v-else-if="theme === 'dark'" :icon="['fas', 'moon-stars']" class="fill:current!" />
                </button>
            </div>
            <button @click="doSave" class="button button-secondary b:transparent! fg:sky-80! fg:sky-40!@dark b:sky-80!:hover bg:transparent!" v-ripple>
                Save
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
html:has(#windpress-app.universal) {
    .macos__button {
        &.close {
            background: #ff5f57;
            border-color: #de3f37;
        }

        &.minimize {
            background: #febc2e;
            border-color: #de9c0e;
        }

        &.expand {
            background: #28c840;
            border-color: #05a61d;
        }
    }
}
</style>