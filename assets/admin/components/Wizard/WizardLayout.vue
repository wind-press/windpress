<script setup>
import { ref } from 'vue';
import Profiles from './Profiles/ProfilesLayout.vue';
import Plugins from './Plugins/PluginsLayout.vue';
import Screens from './Screens/ScreensLayout.vue';
import Spacing from './Spacing/SpacingLayout.vue';
import Typography from './Typography/TypographyLayout.vue';
import Colors from './Colors/ColorsLayout.vue';

const currentTab = ref('Profiles');

const tabs = {
    Profiles,
    Plugins,
    Screens,
    Spacing,
    Typography,
    Colors,
};
</script>

<template>
    <div class="h:600">
        <div class="grid bg:gray-10 box-shadow:0|2px|5px|rgba(0,0,0,.051) grid-template-columns:clamp(12rem,12vw,12rem)|1fr h:full mx:0 my:0 overflow:hidden! rb:8">
            <nav class="flex bg:gray-10 br:1|solid|gray-90/.1 flex:col justify-content:space-between p:12">
                <ul class="{p:8;capitalize;font:15;fg:gray-60;font:medium;r:6;cursor:pointer}>li {fg:black:hover;bg:gray-20:hover}>li:hover,>li.active-menu m:0">
                    <li @click="currentTab = 'Screens'" :class="[{ 'active-menu': currentTab === 'Screens' }]">
                        <font-awesome-icon :icon="['far', 'laptop-mobile']" class="pr:6" />
                        <span>
                            Screens
                        </span>
                    </li>
                    <li @click="currentTab = 'Spacing'" :class="[{ 'active-menu': currentTab === 'Spacing' }]">
                        <font-awesome-icon :icon="['far', 'arrows-left-right-to-line']" class="pr:6" />
                        <span>
                            Spacing
                        </span>
                    </li>
                    <li @click="currentTab = 'Typography'" :class="[{ 'active-menu': currentTab === 'Typography' }]">
                        <font-awesome-icon :icon="['far', 'text-size']" class="pr:6" />
                        <span>
                            Typography
                        </span>
                    </li>
                    <li @click="currentTab = 'Colors'" :class="[{ 'active-menu': currentTab === 'Colors' }]">
                        <font-awesome-icon :icon="['far', 'palette']" class="pr:6" />
                        <span>
                            Colors
                        </span>
                    </li>
                    <li @click="currentTab = 'Plugins'" :class="[{ 'active-menu': currentTab === 'Plugins' }]">
                        <font-awesome-icon :icon="['fab', 'npm']" class="pr:6" />
                        <span>
                            Plugins
                        </span>
                    </li>
                </ul>
                <ul class="{p:8;capitalize;font:15;fg:gray-60;font:medium;r:6;cursor:pointer}>li {fg:black:hover;bg:gray-20:hover}>li:hover,>li.active-menu m:0 ">
                    <li @click="currentTab = 'Profiles'" :class="[{ 'active-menu': currentTab === 'Profiles' }]">
                        <font-awesome-icon :icon="['far', 'masks-theater']" class="pr:6" />
                        <span>
                            Profiles
                        </span>
                    </li>
                </ul>
            </nav>
            <!-- side navigation -->

            <div class="bg:white overflow-y:auto overscroll-behavior:contain rbr:8 scroll-behavior:smooth">
                <!-- if not profile section selected, show Profile bar -->

                <!-- section content goes here -->
                <!-- if profile was not selected, redirect to profile section -->
                <component :is="tabs[currentTab]" />
            </div>
        </div>

    </div>
</template>