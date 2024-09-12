<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList, loadDesignSystem } from '@/packages/core/tailwind';
import ExpansionPanel from './ExpansionPanel.vue';
import { set } from 'lodash-es';
import CommonVariableItems from './CommonVariableItems.vue';
import ColorVariableItems from './ColorVariableItems.vue';

const commonVar = ref({
    colors: {},
    typography: {},
    sizing: {},
});

const focusedInput = inject('focusedInput');
const recentColorPickerTarget = inject('recentColorPickerTarget');

async function constructVariableList() {
    // get design system
    const main_css = await brxIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = await getVariableList(await loadDesignSystem(main_css));

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
}

const sectionColor = ref(null);
const sectionTypography = ref(null);
const sectionSpacing = ref(null);

watch(focusedInput, (value) => {
    if (value) {
        const control = value.closest('[data-controlkey]');
        const dataControlKey = control?.dataset.controlkey?.toLocaleLowerCase() ?? '';
        const isFontSize = ['typography', 'font'].some(key => dataControlKey.includes(key));
        const isSpacing = ['padding', 'margin', 'gap', 'width', 'height'].some(key => dataControlKey.includes(key));
        const isColorInput = value.parentElement?.parentElement?.classList.contains('color-input');

        sectionTypography.value.togglePanel(false);
        sectionSpacing.value.togglePanel(false);
        sectionColor.value.togglePanel(false);
        if (isColorInput) {
            sectionColor.value.togglePanel(true);
            sectionColor.value.scrollIntoView();
        } else if (isFontSize) {
            sectionTypography.value.togglePanel(true);
            sectionTypography.value.scrollIntoView();
        } else if (isSpacing) {
            sectionSpacing.value.togglePanel(true);
            sectionSpacing.value.scrollIntoView();
        }
    }
});

watch(recentColorPickerTarget, (value) => {
    if (value) {
        sectionColor.value.togglePanel(true);
        sectionColor.value.scrollIntoView();
    }
});

onMounted(() => {
    constructVariableList();
});

const channel = new BroadcastChannel('windpress');

channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/autocomplete';
    const target = 'any';
    const task = 'windpress.code-editor.saved.done';

    if (data.source === source && data.task === task) {
        setTimeout(() => {
            constructVariableList();
        }, 1000);

    }
});
</script>

<template>
    <div id="windpressbricks-variable-app-body" class="rel w:full h:full overflow-y:scroll! bb:1|solid|$(builder-border-color)>div:not(:last-child)">
        <ExpansionPanel namespace="variable" name="color" ref="sectionColor">
            <template #header>
                <span class="font:semibold">Color</span>
            </template>

            <template #default>
                <ColorVariableItems :variableItems="commonVar.colors" />
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="typography" ref="sectionTypography">
            <template #header>
                <span class="font:semibold">Typography</span>
            </template>

            <template #default>
                <CommonVariableItems :variableItems="commonVar.typography" />
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="spacing" ref="sectionSpacing" class="">
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