<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { inject, onBeforeMount, watch, defineComponent, h, type Ref } from 'vue';
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
            'primary': '#3b82f6',
            'secondary': '#64748b',
            'accent': '#f59e0b',
            'neutral': '#6b7280'
        }
    },
    {
        name: __('Semantic Colors', 'windpress'),
        description: __('Status and feedback colors', 'windpress'),
        colors: {
            'success': '#10b981',
            'warning': '#f59e0b',
            'error': '#ef4444',
            'info': '#3b82f6'
        }
    },
    {
        name: __('Grayscale', 'windpress'),
        description: __('Neutral grayscale palette', 'windpress'),
        colors: {
            'gray-50': '#f9fafb',
            'gray-100': '#f3f4f6',
            'gray-200': '#e5e7eb',
            'gray-300': '#d1d5db',
            'gray-400': '#9ca3af',
            'gray-500': '#6b7280',
            'gray-600': '#4b5563',
            'gray-700': '#374151',
            'gray-800': '#1f2937',
            'gray-900': '#111827'
        }
    }
];

function addPalette(palette: typeof colorPalettes[0]) {
    Object.entries(palette.colors).forEach(([key, value]) => {
        // Check if color already exists
        const existingItem = items.value.find(item => item.var.key === key);
        if (!existingItem) {
            addNext(undefined, key, value);
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
        <UDashboardNavbar :title="i18n.__('Colors', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:swatch-book" class="size-5" />
                {{ i18n.__('Colors', 'wizard') }}
                <UBadge variant="soft" color="neutral">--color-*</UBadge>
                <UTooltip :text="i18n.__('Color utilities like bg-primary, text-accent, and border-neutral', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('Color utilities like bg-primary, text-accent, and border-neutral', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UDropdownMenu 
                    :items="[
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
                    ]"
                    :ui="{ content: 'w-64' }"
                >
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
                    <UButton 
                        :label="i18n.__('Add Color', 'windpress')" 
                        icon="lucide:plus" 
                        color="primary" 
                        @click="addColorNext()"
                    />
                    <UDropdownMenu 
                        :items="colorPalettes.map(palette => ({
                            label: palette.name,
                            description: palette.description,
                            icon: 'lucide:palette',
                            onSelect: () => addPalette(palette)
                        }))"
                        :ui="{ content: 'w-64' }"
                    >
                        <UButton 
                            :label="i18n.__('Choose Palette', 'windpress')" 
                            icon="lucide:palette" 
                            variant="outline"
                        />
                    </UDropdownMenu>
                </div>
            </div>

            <!-- Color tree when colors exist -->
            <UTree v-else :items :ui="{ link: 'p-0' }" :expanded="expandedTree">
                <template #item="{ item, level }">
                    <WizardTreeItem 
                        :item="item" 
                        :level="level || 0" 
                        :should-be-dimmed="shouldBeDimmed" 
                        :was-recently-moved="wasRecentlyMoved" 
                        :is-descendant-of="isDescendantOf" 
                        :on-add-next="addColorNext" 
                        :on-add-child="addColorChild" 
                        :on-delete="deleteColor" 
                    >
                            <template #preview="{ item }">
                                <div 
                                    v-if="item.var?.value && item.var.value.startsWith('#')"
                                    class="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 ml-2 flex-shrink-0"
                                    :style="{ backgroundColor: item.var.value }"
                                    :title="item.var.value"
                                ></div>
                            </template>
                        </WizardTreeItem>
                </template>
            </UTree>

        </div>
    </UDashboardPanel>
</template>