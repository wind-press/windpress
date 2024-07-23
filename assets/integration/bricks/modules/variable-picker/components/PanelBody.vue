<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { brxGlobalProp, brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList } from '@/packages/core/tailwind';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import ExpansionPanel from './ExpansionPanel.vue';
import { get, set } from 'lodash-es';
import CommonVariableItems from './CommonVariableItems.vue';

const commonVar = ref({
    colors: {},
    typography: {},
    sizing: {},
});

async function constructVariableList() {
    // get design system
    const main_css = await brxIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = getVariableList(__unstable__loadDesignSystem(main_css));

    /**
     * Color
     */

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

    commonVar.value.colors = Object.keys(palette).sort().reduce((acc, key) => {
        acc[key] = palette[key];
        return acc;
    }, {});

    /**
     * Typography
     */

    const typography = {
        font_size: [],
        line_height: [],
        letter_spacing: [],
    };

    // 1. find where the key prefixed with '--font-size-' and without suffixed '--line-height'
    // 2. find where the key prefixed with '--line-height-' or suffixed '--line-height'
    // 3. find where the key prefixed with '--letter-spacing-'
    variableLists
        .filter((variable) => variable.key.startsWith('--font-size-') && !variable.key.endsWith('--line-height'))
        .forEach((typo) => {
            const key = typo.key.slice(12);
            typography.font_size.push({
                key: typo.key,
                label: key,
                value: typo.value,
            });
        });

    variableLists
        .filter((variable) => variable.key.startsWith('--line-height-') || variable.key.endsWith('--line-height'))
        .forEach((typo) => {
            // const key = typo.key.startsWith('--line-height-') ? typo.key.slice(14) : typo.key.slice(-13);

            // if (typo.key.startsWith('--line-height-')) {
            const key = typo.key.startsWith('--line-height-') ? typo.key.slice(14) : typo.key.slice(2, -13);


            typography.line_height.push({
                key: typo.key,
                label: key,
                value: typo.value,
            });
        });

    // sort label. if it prefixed with 'font-size-', then put it last
    typography.line_height.sort((a, b) => {
        if (a.label.startsWith('font-size-') && !b.label.startsWith('font-size-')) {
            return 1;
        }

        if (!a.label.startsWith('font-size-') && b.label.startsWith('font-size-')) {
            return -1;
        }

        return 0;
    });

    variableLists
        .filter((variable) => variable.key.startsWith('--letter-spacing-'))
        .forEach((typo) => {
            const key = typo.key.slice(17);
            typography.letter_spacing.push({
                key: typo.key,
                label: key,
                value: typo.value,
            });
        });

    commonVar.value.typography = typography;

    /**
     * Sizing
     */

    const sizing = {
        spacing: [],
        width: [],
        breakpoint: [],
    };

    // 1. find where the key prefixed with '--spacing-'
    // 2. find where the key prefixed with '--width-'
    // 3. find where the key prefixed with '--breakpoint-'

    variableLists
        .filter((variable) => variable.key.startsWith('--spacing-'))
        .forEach((size) => {
            const key = size.key.slice(10);
            sizing.spacing.push({
                key: size.key,
                label: key,
                value: size.value,
            });
        });

    variableLists
        .filter((variable) => variable.key.startsWith('--width-'))
        .forEach((size) => {
            const key = size.key.slice(8);
            sizing.width.push({
                key: size.key,
                label: key,
                value: size.value,
            });
        });

    variableLists
        .filter((variable) => variable.key.startsWith('--breakpoint-'))
        .forEach((size) => {
            const key = size.key.slice(13);
            sizing.breakpoint.push({
                key: size.key,
                label: key,
                value: size.value,
            });
        });

    commonVar.value.sizing = sizing;

    console.log(commonVar.value);
}

onMounted(() => {
    constructVariableList();
});


const channel = new BroadcastChannel('windpress');

channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/autocomplete';
    const target = 'any';
    const task = 'windpress.main_css.saved.done';

    if (data.source === source && data.task === task) {
        setTimeout(() => {
            constructVariableList();
        }, 1000);

    }
});
</script>

<template>
    <div id="windpressbricks-variable-app-body" class="rel w:full h:full overflow-y:scroll!">
        <ExpansionPanel namespace="variable" name="color" class="">
            <template #header>
                <span class="font:semibold">Color</span>
            </template>

            <template #default>
                <div class="{m:10;pb:15}>div bb:1|solid|$(builder-border-color)>div:not(:last-child)">
                    <div v-for="(color, key) in (() => commonVar.colors)()" :key="key" class="">
                        <div class="variable-section-title font:14 my:10">
                            {{ key }}
                        </div>

                        <template v-if="color.DEFAULT">
                            <div class="variable-section-items">
                                <button v-tooltip="{ placement: 'top', content: `var(${color.DEFAULT.key})` }" :class="`bg:\$\(${color.DEFAULT.key.slice(2)}\)`" class="w:full r:4 h:24 border:1|solid|transparent border:white:hover"></button>
                            </div>
                        </template>

                        <!-- if has shades and shades > 0 -->
                        <template v-if="color.shades && Object.keys(color.shades).length > 0">
                            <div :class="[{}, true ? `grid-template-cols:repeat(${Object.keys(color.shades).length},auto)` : '']" class="variable-section-items grid r:4 overflow:hidden">
                                <div v-for="(shade, shadeKey) in color.shades" :key="shadeKey" class="flex gap:10">
                                    <button v-tooltip="{ placement: 'top', content: `var(${shade.key})` }" :class="`bg:\$\(${shade.key.slice(2)}\)`" class="w:full h:24 border:1|solid|transparent border:white:hover"></button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="typography" class="">
            <template #header>
                <span class="font:semibold">Typography</span>
            </template>

            <template #default>
                <CommonVariableItems :variableItems="commonVar.typography" />
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="spacing" class="">
            <template #header>
                <span class="font:semibold">Sizing</span>
            </template>

            <template #default>
                <CommonVariableItems :variableItems="commonVar.sizing" />
            </template>
        </ExpansionPanel>
    </div>
</template>

<style lang="scss" scoped>
#windpressbricks-variable-app-body {
    scrollbar-color: var(--builder-gray-5) transparent;
}
</style>