<script setup lang="ts">
import { nanoid } from 'nanoid';
import { __ } from '@wordpress/i18n';
import { onBeforeRouteLeave } from 'vue-router'
import { inject, onBeforeMount, watch, type Ref } from 'vue';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import { useWizardTree } from '@/dashboard/composables/useWizardTree';
import { useWizardDragDrop } from '@/dashboard/composables/useWizardDragDrop';
import WizardTreeItem from '@/dashboard/components/Wizard/WizardTreeItem.vue';
import { default as FluidCalculatorSlideover, type FluidCalculatorData } from '@/dashboard/components/Wizard/FluidCalculatorSlideover.vue';

const overlay = useOverlay()
const toast = useToast()

const theme = inject('theme') as Ref<WizardTheme>;

const treeLogic = useWizardTree('spacing', theme);
const { expandedTree, items, updateThemeFromItems, findItemByUid, addChild, addNext, initializeItems, findOrCreateItemByKey } = treeLogic;

const dragDropLogic = useWizardDragDrop(items, updateThemeFromItems, findItemByUid);
const { shouldBeDimmed, wasRecentlyMoved, isDescendantOf } = dragDropLogic;

watch(() => theme.value.namespaces.spacing, () => {
    initializeItems();
}, { deep: true });

function addSpacingChild(uid: string) {
    addChild(uid, 'sp');
}

function addSpacingNext(uid: string) {
    addNext(uid, 'sp');
}

function calcFluid(
    minSize: number,
    maxSize: number,
    minWidth: number,
    maxWidth: number
): string {
    // Calculate the slope
    const slope: number = (maxSize - minSize) / (maxWidth - minWidth);

    // Calculate the y-intersection
    const yIntersection: number = (-1 * minWidth) * slope + minSize;

    // Return the clamp CSS
    return `clamp(${parseFloat((minSize / 16).toFixed(4).toString())}rem, ${parseFloat((yIntersection / 16).toFixed(4).toString())}rem + ${parseFloat((slope * 100).toFixed(4).toString())}vw, ${parseFloat((maxSize / 16).toFixed(4).toString())}rem)`;
}

function generateFluidSpacing(fluidConfig: FluidCalculatorData) {
    let parentItem = null;

    let newItemPool = [];

    const prefix = fluidConfig.miscPrefix
        .trim()
        .replace(/^[\s-]+|[\s-]+$/g, '')
        .replace(/[^a-zA-Z0-9-]/g, '_');

    if (prefix) {
        parentItem = findOrCreateItemByKey(prefix);
    }

    for (let i = 1; i <= fluidConfig.stepsSmaller; i++) {
        let key = '';
        if (i === fluidConfig.stepsSmaller) {
            key += 'sm';
        } else if (i === fluidConfig.stepsSmaller - 1) {
            key += 'xs';
        } else {
            key += `${fluidConfig.stepsSmaller - i}xs`;
        }

        let currentMinSize = fluidConfig.minSize;
        let currentMaxSize = fluidConfig.maxSize;

        for (let j = 0; j < fluidConfig.stepsSmaller + 1 - i; j++) {
            currentMinSize /= fluidConfig.minScale;
            currentMaxSize /= fluidConfig.maxScale;
        }

        newItemPool.push({
            key: key,
            value: calcFluid(currentMinSize, currentMaxSize, fluidConfig.minViewport, fluidConfig.maxViewport),
        });
    }

    newItemPool.push({
        key: 'base',
        value: calcFluid(fluidConfig.minSize, fluidConfig.maxSize, fluidConfig.minViewport, fluidConfig.maxViewport),
    });

    for (let i = 1; i <= fluidConfig.stepsLarger; i++) {
        let key = '';
        if (i === 1) {
            key += 'lg';
        } else if (i === 2) {
            key += 'xl';
        } else {
            key += `${i - 1}xl`;
        }

        let currentMinSize = fluidConfig.minSize;
        let currentMaxSize = fluidConfig.maxSize;
        for (let j = 0; j < i; j++) {
            currentMinSize *= fluidConfig.minScale;
            currentMaxSize *= fluidConfig.maxScale;
        }

        newItemPool.push({
            key: key,
            value: calcFluid(currentMinSize, currentMaxSize, fluidConfig.minViewport, fluidConfig.maxViewport),
        });
    }

    let newItems = newItemPool.map(item => ({
        value: nanoid(7),
        var: {
            key: item.key,
            value: item.value,
        },
        defaultExpanded: true,
        onSelect: (e: Event) => {
            e.preventDefault()
        },
        onToggle: (e: Event) => {
            e.preventDefault()
        },
    }));

    if (parentItem) {
        if (!parentItem.children) {
            parentItem.children = [];
        }
        parentItem.children.push(...newItems);
    } else {
        items.value.push(...newItems);
    }
}

async function openFluidCalculator() {
    const slideover = overlay.create(FluidCalculatorSlideover, { destroyOnClose: true });
    const instance = slideover.open();
    const fluidData = await instance.result;

    if (!fluidData) {
        console.warn('Fluid Calculator was closed without generating data.');
        return;
    }

    generateFluidSpacing(fluidData);

    toast.add({
        title: __('Generated', 'windpress'),
        description: __('Fluid spacing variables have been generated successfully.', 'windpress'),
        icon: 'i-lucide-check',
        color: 'success',
    });
}

onBeforeMount(() => {
    initializeItems();
});

onBeforeRouteLeave((_, __, next) => {
    updateThemeFromItems();
    next();
});
</script>

<template>
    <UDashboardPanel id="wizard-spacing" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Spacing', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:align-horizontal-space-around" class="size-5" />
                {{ i18n.__('Spacing', 'wizard') }}
                <UBadge variant="soft" color="neutral">--spacing-*</UBadge>
                <UTooltip :text="i18n.__('Spacing and sizing utilities like px-4, max-h-16, and many more', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('Spacing and sizing utilities like px-4, max-h-16, and many more', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UTooltip :text="i18n.__('Fluid generator', 'windpress')">
                    <UButton icon="lucide:wand-sparkles" color="neutral" variant="soft" @click="openFluidCalculator" />
                </UTooltip>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/theme#theme-variable-namespaces" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto p-4">
            <!-- TreeItem -->
            <UTree :items :ui="{ link: 'p-0' }" :default-expanded="expandedTree">
                <template #item="{ item, level }">
                    <WizardTreeItem :item="item" :level="level || 0" :should-be-dimmed="shouldBeDimmed" :was-recently-moved="wasRecentlyMoved" :is-descendant-of="isDescendantOf" :on-add-next="addSpacingNext" :on-add-child="addSpacingChild" />
                </template>
            </UTree>
        </div>

    </UDashboardPanel>
</template>