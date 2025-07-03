<script setup lang="ts">
import { ref } from 'vue'

import type { TreeItem } from '@nuxt/ui'

const items: TreeItem[] = [
    {
        label: 'app/',
        defaultExpanded: true,
        onToggle: (e: Event) => {
            e.preventDefault()
        },
        children: [
            {
                label: 'composables/',
                children: [
                    { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
                    { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
                ]
            },
            {
                label: 'components/',
                defaultExpanded: true,
                children: [
                    { label: 'Card.vue', icon: 'i-vscode-icons-file-type-vue' },
                    { label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }
                ]
            }
        ]
    },
    { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
    { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' }
]

const value = ref()
</script>

<template>
    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
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
                <UTooltip :text="i18n.__('Save', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/responsive-design#customizing-your-theme" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto">
            <!-- <vue-monaco-editor v-model:value="props.entry.content" :language="props.entry.relative_path.endsWith('.css') ? 'css' : 'javascript'" :saveViewState="false" :options="{ ...MONACO_EDITOR_OPTIONS, readOnly: props.entry.readonly }" @mount="handleEditorMount" :theme="colorMode === 'dark' ? 'vs-dark' : 'vs'" /> -->
        </div>

    </UDashboardPanel>
</template>