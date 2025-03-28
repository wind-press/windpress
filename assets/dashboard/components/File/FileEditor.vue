<script setup lang="ts">
import { __ } from '@wordpress/i18n';
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useColorMode } from '@vueuse/core';
import path from 'path';
import { shallowRef } from 'vue';
import { getVariableList, loadDesignSystem, naturalExpand } from '@/packages/core/tailwindcss';

import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

// TODO: monaco autocomplete, broadcast event with channel on save

type MonacoEditor = typeof monacoEditor;

const volumeStore = useVolumeStore()
const settingsStore = useSettingsStore()
const colorMode = useColorMode()

const props = defineProps<{
    entry: Entry;
}>()

const emit = defineEmits<{
    close: [];
    save: [];
    delete: [entry: Entry];
    reset: [entry: Entry];
}>()

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: false,
    formatOnPaste: false,
    fontSize: 14,
};

const editorElementRef = shallowRef();

function handleEditorMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: MonacoEditor) {
    monaco.languages.css.cssDefaults.setOptions(
        Object.assign(
            monaco.languages.css.cssDefaults.options,
            {
                data: {
                    useDefaultDataProvider: true,
                    dataProviders: {
                        tailwindcss: {
                            version: 1.1,
                            atDirectives: [
                                {
                                    name: '@theme',
                                    status: 'standard',
                                    description: __('Theme variables are special CSS variables defined using the `@theme` directive that influence which utility classes exist in your project.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Theme variables', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/theme'
                                        }
                                    ],
                                },
                                {
                                    name: '@plugin',
                                    status: 'standard',
                                    description: __('Use the `@plugin` directive to load a legacy JavaScript-based plugin.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Functions & Directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#plugin-directive',
                                        },
                                        {
                                            name: __('Docs: Tailwind CSS plugins', 'windpress'),
                                            url: 'https://wind.press/docs/configuration/file-main-css#tailwind-css-plugins',
                                        },
                                    ],
                                },
                                {
                                    name: '@config',
                                    status: 'standard',
                                    description: __('Use the `@config` directive to load a legacy JavaScript-based configuration file.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Functions & Directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#config-directive',
                                        },
                                        {
                                            name: __('Docs: Tailwind CSS configuration', 'windpress'),
                                            url: 'https://wind.press/docs/configuration/file-main-css#tailwind-css-configuration',
                                        }
                                    ],
                                },
                                {
                                    name: '@tailwind',
                                    status: 'standard',
                                    description: __('Use the `@tailwind` directive to insert Tailwind\'s `base`, `components`, `utilities` and `variants` styles into your CSS.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Tailwind CSS functions & directives', 'windpress'),
                                            url: 'https://v3.tailwindcss.com/docs/functions-and-directives#tailwind',
                                        },
                                    ],
                                },
                                {
                                    name: '@apply',
                                    status: 'standard',
                                    description: __('Use the `@apply` directive to inline any existing utility classes into your own custom CSS.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Tailwind CSS functions & directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#apply-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@utility',
                                    status: 'standard',
                                    description: __('Use the `@utility` directive to add custom utilities to your project that work with variants like `hover`, `focus` and `lg``.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Tailwind CSS functions & directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#utility-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@custom-variant',
                                    status: 'standard',
                                    description: __('Use the `@custom-variant` directive to add a custom variant in your project.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Tailwind CSS functions & directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#custom-variant-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@variant',
                                    status: 'standard',
                                    description: __('Use the `@variant` directive to apply a Tailwind variant to styles in your CSS.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Tailwind CSS functions & directives', 'windpress'),
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#variant-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@source',
                                    status: 'standard',
                                    description: __('Use the `@source` directive to scan additional source files.', 'windpress'),
                                    references: [
                                        {
                                            name: __('Docs: Scanning additional Sources', 'windpress'),
                                            url: 'https://wind.press/docs/configuration/file-main-css#scanning-additional-sources',
                                        },
                                    ],
                                },
                            ],
                        }
                    }
                }
            }
        )
    );

    editorElementRef.value = editor;

    monaco.languages.registerCompletionItemProvider('css', {
        async provideCompletionItems(model, position) {
            const wordInfo = model.getWordUntilPosition(position);

            let variables: any[] = [];

            if (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 4) {
                variables = (await getVariableList(await loadDesignSystem({ volume: volumeStore.getKVEntries() }))).map((entry) => {
                    return {
                        kind: entry.key.includes('--color') ? monaco.languages.CompletionItemKind.Color : monaco.languages.CompletionItemKind.Variable,
                        label: entry.key,
                        insertText: entry.key,
                        detail: entry.value,
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: wordInfo.startColumn,
                            endLineNumber: position.lineNumber,
                            endColumn: wordInfo.endColumn
                        },
                        sortText: naturalExpand(entry.index)
                    }
                });
            }

            return {
                suggestions: variables
            };
        }
    });

    // add key binding command to monaco.editor to save all changes
    monaco.editor.addEditorAction({
        id: 'save',
        label: __('Save', 'windpress'),
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
            emit('save');
        }
    });
}
</script>

<template>
    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="entry?.relative_path" :toggle="false">
            <template #leading>
                <UTooltip :text="i18n.__('Close', 'windpress')">
                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emit('close')" />
                </UTooltip>
            </template>

            <template #title>
                <UIcon :name="`vscode-icons:file-type-${entry?.relative_path === 'main.css' ? 'tailwind' : path.extname(entry?.relative_path ?? '').replace('.', '')}`" class="size-5" />
                {{ entry?.relative_path }}
                <UBadge v-if="props.entry.readonly" :label="i18n.__('read-only', 'windpress')" color="warning" variant="outline" />
            </template>

            <template #right>
                <UTooltip v-if="entry?.relative_path !== 'main.css' && !(Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Delete', 'windpress')">
                    <UButton icon="i-lucide-trash" color="neutral" variant="ghost" @click="emit('delete', entry)" />
                </UTooltip>

                <UTooltip v-if="entry?.relative_path === 'main.css' || (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Reset to default', 'windpress')">
                    <UButton icon="lucide:file-minus-2" color="neutral" variant="ghost" @click="emit('reset', entry)" />
                </UTooltip>

                <UTooltip :text="i18n.__('Save', 'windpress')">
                    <UButton icon="i-lucide-save" color="primary" variant="subtle" @click="emit('save')" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto">
            <vue-monaco-editor v-model:value="props.entry.content" :language="props.entry.relative_path.endsWith('.css') ? 'css' : 'javascript'" :saveViewState="false" :options="{ ...MONACO_EDITOR_OPTIONS, readOnly: props.entry.readonly }" @mount="handleEditorMount" :theme="colorMode === 'dark' ? 'vs-dark' : 'vs'" />
        </div>

    </UDashboardPanel>
</template>