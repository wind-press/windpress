<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'
import { inject, onBeforeMount, ref, watch, type Ref } from 'vue';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import { useWizardTree } from '@/dashboard/composables/useWizardTree';
import { useWizardDragDrop } from '@/dashboard/composables/useWizardDragDrop';
import WizardTreeItem from '@/dashboard/components/Wizard/WizardTreeItem.vue';
import { __ } from '@wordpress/i18n';

const theme = inject('theme') as Ref<WizardTheme>;
const activeTab = ref('text');

// Text Tree
const textTreeLogic = useWizardTree('text', theme);
const { expandedTree: expandedTreeText, items: textItems, updateThemeFromItems: updateTextTheme, findItemByUid: findTextItem, addChild: addTextChild, addNext: addTextNext, initializeItems: initializeTextItems } = textTreeLogic;

const textDragDropLogic = useWizardDragDrop(textItems, updateTextTheme, findTextItem);
const { shouldBeDimmed: shouldBeDimmedText, wasRecentlyMoved: wasRecentlyMovedText, isDescendantOf: isDescendantOfText } = textDragDropLogic;

// Font Tree
const fontTreeLogic = useWizardTree('font', theme);
const { expandedTree: expandedTreeFont, items: fontItems, updateThemeFromItems: updateFontTheme, findItemByUid: findFontItem, addChild: addFontChild, addNext: addFontNext, initializeItems: initializeFontItems } = fontTreeLogic;

const fontDragDropLogic = useWizardDragDrop(fontItems, updateFontTheme, findFontItem);
const { shouldBeDimmed: shouldBeDimmedFont, wasRecentlyMoved: wasRecentlyMovedFont, isDescendantOf: isDescendantOfFont } = fontDragDropLogic;

// Watch for changes in each namespace
watch(() => theme.value.namespaces.text, () => {
    initializeTextItems();
}, { deep: true });

watch(() => theme.value.namespaces.font, () => {
    initializeFontItems();
}, { deep: true });

// Navigation links for UTabs
const links = ref<NavigationMenuItem[]>([
    {
        label: __('Text Size', 'windpress'),
        icon: 'lucide:a-large-small',
        value: 'text',
    },
    {
        label: __('Font Family', 'windpress'),
        icon: 'lucide:type',
        value: 'font',
    },
]);

function addTextChildHandler(uid: string) {
    addTextChild(uid);
}

function addTextNextHandler(uid: string) {
    addTextNext(uid);
}

function addFontChildHandler(uid: string) {
    addFontChild(uid);
}

function addFontNextHandler(uid: string) {
    addFontNext(uid);
}

function addNext() {
    if (activeTab.value === 'text') {
        addTextNext();
    } else if (activeTab.value === 'font') {
        addFontNext();
    }
}

onBeforeMount(() => {
    initializeTextItems();
    initializeFontItems();
});

onBeforeRouteLeave((_, __, next) => {
    updateTextTheme();
    updateFontTheme();
    next();
});
</script>

<template>
    <UDashboardPanel id="wizard-typography" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="__('Typography', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:a-large-small" class="size-5" />
                {{ __('Typography', 'wizard') }}
                <UBadge variant="soft" color="neutral">--text-* / --font-*</UBadge>
                <UTooltip :text="__('Font size utilities like text-xl and font family utilities like font-sans', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ __('Font size utilities like text-xl and font family utilities like font-sans', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UTooltip :delay-duration="0" :text="i18n.__('Add new item', 'windpress')">
                    <UButton color="primary" variant="subtle" icon="i-lucide-plus" @click="addNext()" />
                </UTooltip>
                <UTooltip :text="__('Help', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/theme#theme-variable-namespaces" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <UTabs variant="link" :content="false" v-model="activeTab" :items="links" class="" :ui="{list: 'px-4 sm:px-6  zzzzzzzzz'}" />

        <div v-if="activeTab === 'text'" class="p-4">
            <!-- Text Size TreeItem -->
            <UTree :items="textItems" :ui="{ link: 'p-0' }" :default-expanded="expandedTreeText">
                <template #item="{ item, level }">
                    <WizardTreeItem :item="item" :level="level || 0" :should-be-dimmed="shouldBeDimmedText" :was-recently-moved="wasRecentlyMovedText" :is-descendant-of="isDescendantOfText" :on-add-next="addTextNextHandler" :on-add-child="addTextChildHandler" />
                </template>
            </UTree>
        </div>

        <div v-if="activeTab === 'font'" class="p-4">
            <!-- Font Family TreeItem -->
            <UTree :items="fontItems" :ui="{ link: 'p-0' }" :default-expanded="expandedTreeFont">
                <template #item="{ item, level }">
                    <WizardTreeItem :item="item" :level="level || 0" :should-be-dimmed="shouldBeDimmedFont" :was-recently-moved="wasRecentlyMovedFont" :is-descendant-of="isDescendantOfFont" :on-add-next="addFontNextHandler" :on-add-child="addFontChildHandler" />
                </template>
            </UTree>
        </div>
    </UDashboardPanel>
</template>