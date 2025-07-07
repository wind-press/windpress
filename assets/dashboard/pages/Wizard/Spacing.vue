<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { inject, onBeforeMount, watch, type Ref } from 'vue';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import { useWizardTree } from '@/dashboard/composables/useWizardTree';
import { useWizardDragDrop } from '@/dashboard/composables/useWizardDragDrop';
import WizardTreeItem from '@/dashboard/components/Wizard/WizardTreeItem.vue';
import FluidCalculatorSlideover from '@/dashboard/components/Wizard/FluidCalculatorSlideover.vue';

const overlay = useOverlay()




async function openFluidCalculator() {
    const slideover = overlay.create(FluidCalculatorSlideover, {destroyOnClose: true});
    const instance = slideover.open();
    const fluidData = await instance.result;

    console.log('Fluid Calculator result:', fluidData);
}

const theme = inject('theme') as Ref<WizardTheme>;

const treeLogic = useWizardTree('spacing', theme);
const { expandedTree, items, updateThemeFromItems, findItemByUid, addChild, addNext, initializeItems } = treeLogic;

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