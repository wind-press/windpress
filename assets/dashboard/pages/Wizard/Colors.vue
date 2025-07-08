<script setup lang="ts">
import 'vue-color/style.css';
import { ChromePicker } from 'vue-color'
import Color from 'colorjs.io';
import { onBeforeRouteLeave } from 'vue-router'
import { ref, inject, onBeforeMount, watch, type Ref, nextTick } from 'vue';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import { useWizardTree } from '@/dashboard/composables/useWizardTree';
import { useWizardDragDrop } from '@/dashboard/composables/useWizardDragDrop';
import WizardTreeItem from '@/dashboard/components/Wizard/WizardTreeItem.vue';
import { __ } from '@wordpress/i18n';

const theme = inject('theme') as Ref<WizardTheme>;

const treeLogic = useWizardTree('color', theme);
const { expandedTree, items, updateThemeFromItems, findItemByUid, addChild, addNext, deleteItem, initializeItems } = treeLogic;

const dragDropLogic = useWizardDragDrop(items, updateThemeFromItems, findItemByUid);
const { shouldBeDimmed, wasRecentlyMoved, isDescendantOf } = dragDropLogic;

watch(() => theme.value.namespaces.color, () => {
    initializeItems();
}, { deep: true });

function addColorChild(uid: string) {
    addChild(uid);
}

function addColorNext(uid?: string) {
    addNext(uid);
}

function deleteColor(uid: string) {
    deleteItem(uid);
}

// Predefined color palettes for quick setup
const colorPalettes = [
    {
        name: __('Brand Colors', 'windpress'),
        description: __('Primary brand colors for your design system', 'windpress'),
        colors: {
            'primary': 'oklch(58.5% 0.233 277.117)',
            'secondary': 'oklch(62.3% .214 259.815)',
            'neutral': 'oklch(55.4% 0.046 257.417)'
        }
    },
    {
        name: __('Semantic Colors', 'windpress'),
        description: __('Status and feedback colors', 'windpress'),
        colors: {
            'success': 'oklch(72.3% 0.219 149.579)',
            'warning': 'oklch(79.5% 0.184 86.047)',
            'error': 'oklch(63.7% 0.237 25.331)',
            'info': 'oklch(62.3% 0.214 259.815)'
        }
    },
    {
        name: __('Neutral Grayscale', 'windpress'),
        description: __('A neutral grayscale palette for backgrounds, text, etc', 'windpress'),
        colors: {
            'neutral-50': 'oklch(0.985 0 0)',
            'neutral-100': 'oklch(0.97 0 0)',
            'neutral-200': 'oklch(0.922 0 0)',
            'neutral-300': 'oklch(0.87 0 0)',
            'neutral-400': 'oklch(0.708 0 0)',
            'neutral-500': 'oklch(0.556 0 0)',
            'neutral-600': 'oklch(0.439 0 0)',
            'neutral-700': 'oklch(0.371 0 0)',
            'neutral-800': 'oklch(0.269 0 0)',
            'neutral-900': 'oklch(0.205 0 0)',
            'neutral-950': 'oklch(0.145 0 0)',
        }
    }
];

function addPalette(palette: typeof colorPalettes[0]) {
    Object.entries(palette.colors).forEach(([key, value]) => {
        // Check if this key contains a dash (e.g., gray-50)
        if (key.includes('-')) {
            const [parentKey, childKey] = key.split('-', 2);

            // Find or create the parent item
            let parentItem = items.value.find((item: any) => item.var.key === parentKey);
            if (!parentItem) {
                // Create parent item first
                addNext(undefined, parentKey, '');
                parentItem = items.value.find((item: any) => item.var.key === parentKey);
            }

            // Check if child already exists
            const childExists = parentItem?.children?.find((child: any) => child.var.key === childKey);
            if (!childExists && parentItem && parentItem.value) {
                addChild(parentItem.value, childKey, value);
            }
        } else {
            // Check if color already exists
            const existingItem = items.value.find((item: any) => item.var.key === key);
            if (!existingItem) {
                addNext(undefined, key, value);
            }
        }
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
    <UDashboardPanel id="wizard-colors" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Colors', 'windpress')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:swatch-book" class="size-5" />
                {{ i18n.__('Colors', 'windpress') }}
                <UBadge variant="soft" color="neutral">--color-*</UBadge>
                <UTooltip :text="i18n.__('Color utilities like bg-primary, text-accent, and border-neutral', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('Color utilities like bg-primary, text-accent, and border-neutral', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UDropdownMenu :items="[
                    {
                        label: i18n.__('Color Palettes', 'windpress'),
                        type: 'label'
                    },
                    ...colorPalettes.map(palette => ({
                        label: palette.name,
                        description: palette.description,
                        icon: 'lucide:palette',
                        onSelect: () => addPalette(palette)
                    }))
                ]" :ui="{ content: 'w-64' }">
                    <UTooltip :text="i18n.__('Add color palette', 'windpress')">
                        <UButton icon="lucide:palette" color="neutral" variant="subtle" />
                    </UTooltip>
                </UDropdownMenu>

                <UTooltip :delay-duration="0" :text="i18n.__('Add new color', 'windpress')">
                    <UButton color="neutral" variant="subtle" icon="i-lucide-plus" @click="addColorNext()" />
                </UTooltip>

                <UTooltip :text="i18n.__('Help', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/customizing-colors" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto p-4">
            <!-- Empty state when no colors are defined -->
            <div v-if="items.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
                <UIcon name="lucide:palette" class="size-12 text-primary/50 mb-4" />
                <h3 class="text-lg font-semibold text-highlighted mb-2">
                    {{ i18n.__('No colors defined', 'windpress') }}
                </h3>
                <p class="text-dimmed mb-6 max-w-sm">
                    {{ i18n.__('Start building your color system by adding individual colors or choosing from predefined palettes.', 'windpress') }}
                </p>
                <div class="flex gap-2">
                    <UButton :label="i18n.__('Add Color', 'windpress')" icon="lucide:plus" color="primary" @click="addColorNext()" />
                    <UDropdownMenu :items="colorPalettes.map(palette => ({
                        label: palette.name,
                        description: palette.description,
                        icon: 'lucide:palette',
                        onSelect: () => addPalette(palette)
                    }))" :ui="{ content: 'w-64' }">
                        <UButton :label="i18n.__('Choose Palette', 'windpress')" icon="lucide:palette" variant="outline" />
                    </UDropdownMenu>
                </div>
            </div>

            <!-- Color tree when colors exist -->
            <UTree v-else :items :ui="{ link: 'p-0' }" :expanded="expandedTree">
                <template #item="{ item, level }">
                    <WizardTreeItem :item="item" :level="level || 0" :should-be-dimmed="shouldBeDimmed" :was-recently-moved="wasRecentlyMoved" :is-descendant-of="isDescendantOf" :on-add-next="addColorNext" :on-add-child="addColorChild" :on-delete="deleteColor">
                        <template #before-value="{ item }">
                            <div>
                                <UTooltip :text="item.var.value">
                                    <div :style="{ backgroundColor: item.var.value || 'var(--ui-bg-elevated)' }" class="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"></div>
                                </UTooltip>
                            </div>
                        </template>

                        <template #value-leading="{ item }">
                            <UPopover>
                                <div class="h-4 w-4 rounded border border-gray-300 dark:border-gray-600" :style="{ backgroundColor: item.var.value || 'var(--ui-bg-elevated)' }" :title="i18n.__('Open color picker', 'windpress')">
                                    <span class="sr-only">{{ i18n.__('Open color picker', 'windpress') }}</span>
                                </div>

                                <template #content>
                                    <ChromePicker :value="item.var.value ? new Color(item.var.value).toString({ format: 'hex' }) : ''" @input="(color: string) => {
                                        const prevColor = new Color(item.var.value);
                                        const nextColor = new Color(color).toString({ format: prevColor.parseMeta.formatId });
                                        item.var.value = nextColor;
                                    }" />
                                </template>
                            </UPopover>
                        </template>
                    </WizardTreeItem>
                </template>
            </UTree>

        </div>
    </UDashboardPanel>
</template>

<style>
.vc-chrome-picker div.toggle-icon svg {
    display: inline;
}
</style>