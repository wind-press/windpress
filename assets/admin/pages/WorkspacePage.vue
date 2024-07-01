<script setup>
import Logo from '../../../windpress.svg';
import { useColorMode } from '@vueuse/core';

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
    <div class="r:12 bg:white h:full box-shadow:0|2px|5px|rgba(0,0,0,.051)">
        <div class="workspace-container flex flex:column h:full">
            <div class="window-header flex flex:row px:12 bb:1|solid|gray-20/.5">
                <div class="window-header__macos py:10 flex flex:row align-items:center gap:6">
                    <div class="window-header__macos__button b:1|solid|gray-20 bg:gray-10 r:full size:10"></div>
                    <div class="window-header__macos__button b:1|solid|gray-20 bg:gray-10 r:full size:10"></div>
                    <div class="window-header__macos__button b:1|solid|gray-20 bg:gray-10 r:full size:10"></div>
                </div>
                <div class="window-header__title py:10 flex flex:row align-items:center flex-grow:1 ml:20 gap:6 justify-content:center">
                    <inline-svg :src="Logo" class="inline-svg fill:current font:18" />
                    <span class="font:16 font:semibold fg:black/.4">WindPress</span>
                    <span class="fg:black/.4">{{ windpress._version }}</span>
                </div>
                <div class="flex align-items:center flex:row gap:6">
                    <button @click="theme = theme === 'dark' ? 'light' : 'dark'" class="flex button button-secondary b:0 bg:transparent bg:gray-10:hover fg:gray-90 min-w:36 my:auto width:auto font:16 align-items:center">
                        <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'sun-bright']" class="fill:current" />
                        <font-awesome-icon v-else-if="theme === 'dark'" :icon="['fas', 'moon-stars']" class="fill:current" />
                    </button>

                    <VDropdown :distance="12">
                        <button class="button button-secondary b:0 bg:transparent bg:gray-10:hover fg:gray-90 min-w:36 my:auto width:auto font:16 align-items:center">
                            <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
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

                    <button class="button button-secondary b:transparent b:#2271b1:hover">
                        Save
                    </button>
                </div>
            </div>

            <div class="window-body w:full flex flex:row flex-grow:1 {bl:1|solid|gray-20/.5}>*+*">
                <div class="left-sidebar-nav w:60 h:full">
                    nav
                </div>
                <div class="left-sidebar w:360">
                    sidebar
                </div>
                <div class="main-panel w:full flex flex:column">
                    <div class="tab-head flex flex:row {cursor:pointer;user-select:none;px:18;py:10;br:1|solid|gray-20/.5;bb:1|solid|gray-20/.5}>.tab-head__item">
                        <div class="tab-head__item">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 54 33" class="h:1em mr:2 vertical-align:-0.125em">
                                <g clip-path="url(#prefix__clip0)">
                                    <path fill="#38bdf8" fill-rule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clip-rule="evenodd" />
                                </g>
                                <defs>
                                    <clipPath id="prefix__clip0">
                                        <path fill="#fff" d="M0 0h54v32.4H0z" />
                                    </clipPath>
                                </defs>
                            </svg>
                            main.css
                        </div>
                        <div class="tab-head__item">
                            <font-awesome-icon :icon="['fas', 'bolt']" class="mr:2" />
                            Wizard
                        </div>
                        <div class="tab-head__item">
                            <font-awesome-icon :icon="['fas', 'gear']" class="mr:2" />
                            Settings
                        </div>
                        <div class="tab-head__item flex-grow:1 br:hidden!"></div>
                    </div>
                    <div class="tab-body">
                        <div class="content-panel">
                            content
                        </div>
                        <div class="dock-panel">
                            <div class="debug-logs"></div>
                            <div class="generated-css"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="status-bar"></div>
        </div>
    </div>
</template>