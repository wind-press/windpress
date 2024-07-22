<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { brxGlobalProp, brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList } from '@/packages/core/tailwind';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import ExpansionPanel from './ExpansionPanel.vue';
import { get, set } from 'lodash-es';

const varColors = ref({});

async function constructVariableList() {
    // get design system
    const main_css = await brxIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = getVariableList(__unstable__loadDesignSystem(main_css));

    const palette = {};

    // find where the key prefixed with '--color-'
    variableLists
        .filter((variable) => variable.key.startsWith('--color'))
        .forEach((color) => {
            const key = color.key.slice(8);
            const segments = key.split('-');

            let colorPath = '';

            if (segments.length > 1) {
                const key = segments[0];
                const shadeKey = segments.slice(1).join('-');
                colorPath = `${key}.shades.'${shadeKey}'`;
            } else {
                colorPath = `${key}.DEFAULT`;
            }

            set(palette, colorPath, color);
        });

    varColors.value = Object.keys(palette).sort().reduce((acc, key) => {
        acc[key] = palette[key];
        return acc;
    }, {});
}

onMounted(() => {
    constructVariableList();
});









/**
Stucture:

- color

- typography:
    - font-size
    - line-height
    - letter-spacing

- Sizing:
    - spacing
    - width
    - breakpoint
*/
</script>

<template>
    <div id="windpressbricks-variable-app-body" class="w:full h:full overflow-y:scroll!">
        <ExpansionPanel namespace="variable" name="color" class="">
            <template #header>
                <span class="font:semibold">Color</span>
            </template>

            <template #default>
                <div v-for="(color, key) in varColors" :key="key" class="m:10">
                    <div class="variable-section-title font:14 my:10 font:semibold">
                        {{ key }}
                    </div>

                    <template v-if="color.DEFAULT">
                        <div class="variable-section-items">
                            <button v-tooltip="{ placement: 'top', content: `var(${color.DEFAULT.key})` }" :class="`bg:\$\(${color.DEFAULT.key.slice(2)}\)`" class="w:full r:4 h:24"></button>
                        </div>
                    </template>

                    <!-- if has shades and shades > 0 -->
                    <template v-if="color.shades && Object.keys(color.shades).length > 0">
                        <div :class="[{}, true ? `grid-template-cols:repeat(${Object.keys(color.shades).length},auto)` : '']" class="variable-section-items grid r:4 overflow:hidden">
                            <div v-for="(shade, shadeKey) in color.shades" :key="shadeKey" class="flex gap:10">
                                <button v-tooltip="{ placement: 'top', content: `var(${shade.key})` }" :class="`bg:\$\(${shade.key.slice(2)}\)`" class="w:full h:24 border:1|solid|transparent border:1|solid|white:hover"></button>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="typography" class="">
            <template #header>
                <span class="font:semibold">Typography</span>
            </template>

            <template #default>
                <div>
                    Typography
                </div>
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="spacing" class="">
            <template #header>
                <span class="font:semibold">Sizing</span>
            </template>

            <template #default>
                <div class="h:1000">
                    Sizing
                </div>
            </template>
        </ExpansionPanel>
    </div>
</template>

<style lang="scss" scoped>
#windpressbricks-variable-app-body {
    scrollbar-color: var(--builder-gray-5) transparent;
}
</style>