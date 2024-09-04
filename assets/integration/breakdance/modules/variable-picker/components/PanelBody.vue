<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { bdeIframe } from '@/integration/breakdance/constant.js';
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

const HOVER_VARIABLE_PREVIEW_TIMEOUT = 1000;

const focusedInput = inject('focusedInput');
const recentVariableSelectionTimestamp = inject('recentVariableSelectionTimestamp');
const tempInputValue = inject('tempInputValue');
const variableApp = inject('variableApp');

async function constructVariableList() {
    // get design system
    const main_css = await bdeIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = await getVariableList(await loadDesignSystem(main_css));

    let styleElement = variableApp.querySelector('style#windpressbreakdance-variable-app-body-style');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'windpressbreakdance-variable-app-body-style';
        variableApp.appendChild(styleElement);
    }

    styleElement.innerHTML = `
        #windpressbreakdance-variable-app-body {
            ${variableLists.map((variable) => `${variable.key}:${variable.value};`).join('')}
        }
    `;

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
        // get the attribute of the closest control for the focused input
        const control = value.closest('[data-test-id]');
        const isColorInput = ['color'].some((keyword) => control.getAttribute('data-test-id').includes(keyword));
        const isFontSize = ['fontSize'].some((keyword) => control.getAttribute('data-test-id').includes(keyword));
        const isSpacing = ['spacing', 'size-width'].some((keyword) => control.getAttribute('data-test-id').includes(keyword));

        sectionTypography.value.togglePanel(false);
        sectionSpacing.value.togglePanel(false);
        sectionColor.value.togglePanel(false);

        async function swithUnitCustom() {
            while (value.parentElement.parentElement.parentElement.querySelector('div.dropdown>button.breakdance-unit-input-unit') === null) {
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            value.parentElement.parentElement.parentElement.querySelector('div.dropdown>button.breakdance-unit-input-unit').click();

            while (document.querySelector('.v-menu__content.menuable__content__active .dropdown-content .v-list .v-list-item:last-child .v-list-item__title') === null) {
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            document.querySelector('.v-menu__content.menuable__content__active .dropdown-content .v-list .v-list-item:last-child .v-list-item__title').click();

            setTimeout(() => {
                value.focus();
            }, 100);
        }

        if (isColorInput) {
            sectionColor.value.togglePanel(true);
            sectionColor.value.scrollIntoView();
        } else if (isFontSize) {
            sectionTypography.value.togglePanel(true);
            sectionTypography.value.scrollIntoView();
            swithUnitCustom();
        } else if (isSpacing) {
            sectionSpacing.value.togglePanel(true);
            sectionSpacing.value.scrollIntoView();
            swithUnitCustom();
        }
    }
});

function onMouseEnter(e, varKey) {
    const timeElapsedBetweenSelections = performance.now() - recentVariableSelectionTimestamp.value;
    const isInCoolDown = timeElapsedBetweenSelections < HOVER_VARIABLE_PREVIEW_TIMEOUT;
    if (isInCoolDown) return;

    if (!focusedInput.value) {
        return;
    }

    focusedInput.value.value = `var(${varKey})`;
    focusedInput.value.dispatchEvent(new Event('input'));
    focusedInput.value.focus();
}

function onMouseLeave(e) {
    if (!focusedInput.value || tempInputValue.value === null) {
        return;
    }

    focusedInput.value.value = tempInputValue.value;
    focusedInput.value.dispatchEvent(new Event('input'));
    focusedInput.value.focus();
}

function onClick(e, varKey) {
    if (!focusedInput.value) {
        return;
    }

    focusedInput.value.value = `var(${varKey})`;
    focusedInput.value.dispatchEvent(new Event('input'));
    focusedInput.value.focus();

    tempInputValue.value = `var(${varKey})`;
    recentVariableSelectionTimestamp.value = performance.now();
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
    <div id="windpressbreakdance-variable-app-body" class="rel w:full h:full overflow-y:scroll! bb:1|solid|$(gray200)>div:not(:last-child)">
        <ExpansionPanel namespace="variable" name="color" ref="sectionColor">
            <template #header>
                <span class="font:semibold">Color</span>
            </template>

            <template #default>
                <ColorVariableItems :variableItems="commonVar.colors" @preview-enter="onMouseEnter" @preview-leave="onMouseLeave" @preview-chose="onClick" />
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="typography" ref="sectionTypography">
            <template #header>
                <span class="font:semibold">Typography</span>
            </template>

            <template #default>
                <CommonVariableItems :variableItems="commonVar.typography" @preview-enter="onMouseEnter" @preview-leave="onMouseLeave" @preview-chose="onClick" />
            </template>
        </ExpansionPanel>
        <ExpansionPanel namespace="variable" name="spacing" ref="sectionSpacing" class="">
            <template #header>
                <span class="font:semibold">Sizing</span>
            </template>

            <template #default>
                <CommonVariableItems :variableItems="commonVar.sizing" @preview-enter="onMouseEnter" @preview-leave="onMouseLeave" @preview-chose="onClick" />
            </template>
        </ExpansionPanel>
    </div>
</template>

<style lang="scss" scoped>
#windpressbreakdance-variable-app-body {
    scrollbar-color: var(--gray300) transparent;
}
</style>