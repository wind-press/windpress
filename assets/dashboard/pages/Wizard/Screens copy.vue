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
    <!-- <div class="p-4 sm:p-6 lg:py-12">
        <div class="flex-1">
            <div class="font-semibold text-base text-highlighted text-pretty">{{ i18n.__('Screens', 'wizard') }}</div>
            <div class="text-[15px] text-pretty text-muted mt-1">
                <UBadge variant="soft" color="neutral">--breakpoint-*</UBadge>
                <span>
                    Responsive breakpoint variants like <code>sm:*</code>
                </span>
            </div>
        </div>


        <UTree v-model="value" :items="items" />
    </div> -->




    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Screens', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <!-- <template #leading>
                <UTooltip :text="i18n.__('Close', 'windpress')">
                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emit('close')" />
                </UTooltip>
            </template> -->

            <!-- <template #title>
                <UIcon :name="`vscode-icons:file-type-${entry?.relative_path === 'main.css' ? 'tailwind' : path.extname(entry?.relative_path ?? '').replace('.', '')}`" class="size-5" />
                {{ entry?.relative_path }}
                <UBadge v-if="props.entry.readonly" :label="i18n.__('read-only', 'windpress')" color="warning" variant="outline" />
                <UTooltip v-if="entry?.path_on_disk" :text="`${i18n.__('Path on disk', 'windpress')}: ${entry?.path_on_disk}`">
                    <span class="text-xs opacity-60 font-normal">
                        [
                        <UIcon name="i-lucide-hard-drive" class="inline-block align-middle me-1" />
                        {{ entry?.path_on_disk }}
                        ]
                    </span>
                </UTooltip>
            </template> -->
            <template #title>
                <UIcon name="lucide:monitor-smartphone" class="size-5" />
                <!-- {{ entry?.relative_path }} -->
                {{ i18n.__('Screens', 'wizard') }}
                <UBadge variant="soft" color="neutral">--breakpoint-*</UBadge>
                <!-- <UBadge v-if="props.entry.readonly" :label="i18n.__('read-only', 'windpress')" color="warning" variant="outline" /> -->
                <!-- <UTooltip v-if="entry?.path_on_disk" :text="`${i18n.__('Path on disk', 'windpress')}: ${entry?.path_on_disk}`">
                    <span class="text-xs opacity-60 font-normal">
                        [
                        <UIcon name="i-lucide-hard-drive" class="inline-block align-middle me-1" />
                        {{ entry?.path_on_disk }}
                        ]
                    </span>
                </UTooltip> -->

                <UTooltip :text="i18n.__('This is a list of screens that you can use in your application. You can customize the screens by using the `class` / `ui` props or in your app.config.ts.', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('This is a list of screens that you can use in your application.', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <!-- <UTooltip v-if="entry?.relative_path !== 'main.css' && !(Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Delete', 'windpress')">
                    <UButton icon="i-lucide-trash" color="neutral" variant="ghost" @click="emit('delete', entry)" />
                </UTooltip>

                <UTooltip v-if="entry?.relative_path === 'main.css' || (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Reset to default', 'windpress')">
                    <UButton icon="lucide:file-minus-2" color="neutral" variant="ghost" @click="emit('reset', entry)" />
                </UTooltip>

                <UTooltip :text="i18n.__('Save', 'windpress')">
                    <UButton icon="i-lucide-save" color="primary" variant="subtle" @click="emit('save')" />
                </UTooltip> -->
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto">
            <!-- <vue-monaco-editor v-model:value="props.entry.content" :language="props.entry.relative_path.endsWith('.css') ? 'css' : 'javascript'" :saveViewState="false" :options="{ ...MONACO_EDITOR_OPTIONS, readOnly: props.entry.readonly }" @mount="handleEditorMount" :theme="colorMode === 'dark' ? 'vs-dark' : 'vs'" /> -->
        </div>

    </UDashboardPanel>










</template>