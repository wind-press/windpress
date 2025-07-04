<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { inject, onBeforeMount, watch, type Ref } from 'vue';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import { useWizardTree } from '@/dashboard/composables/useWizardTree';
import { useWizardDragDrop } from '@/dashboard/composables/useWizardDragDrop';
import WizardTreeItem from '@/dashboard/components/WizardTreeItem.vue';

const theme = inject('theme') as Ref<WizardTheme>;

const treeLogic = useWizardTree('breakpoint', theme);
const { expandedTree, items, updateThemeFromItems, findItemByUid, addChild, addNext, initializeItems } = treeLogic;

const dragDropLogic = useWizardDragDrop(items, updateThemeFromItems, findItemByUid);
const { shouldBeDimmed, wasRecentlyMoved, isDescendantOf } = dragDropLogic;

watch(() => theme.value.namespaces.breakpoint, () => {
    initializeItems();
}, { deep: true });

function addBreakpointChild(uid: string) {
    addChild(uid, 'bp');
}

function addBreakpointNext(uid: string) {
    addNext(uid, 'bp');
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
    <UDashboardPanel id="wizard-screens" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Screens', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:monitor-smartphone" class="size-5" />
                {{ i18n.__('Screens', 'wizard') }}
                <UBadge variant="soft" color="neutral">--breakpoint-*</UBadge>
                <UTooltip :text="i18n.__('Responsive breakpoint variants like sm:*', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('Responsive breakpoint variants like sm:*', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/responsive-design#customizing-your-theme" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto p-4">
            <!-- TreeItem -->
            <UTree :items :ui="{ link: 'p-0' }" :default-expanded="expandedTree">
                <template #item="{ item, level }">
                    <WizardTreeItem
                        :item="item"
                        :level="level || 0"
                        :should-be-dimmed="shouldBeDimmed"
                        :was-recently-moved="wasRecentlyMoved"
                        :is-descendant-of="isDescendantOf"
                        :on-add-next="addBreakpointNext"
                        :on-add-child="addBreakpointChild"
                    />
                </template>
            </UTree>
        </div>

    </UDashboardPanel>
</template>