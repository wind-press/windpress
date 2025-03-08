<script setup lang="ts">
import { useVolumeStore } from '@/dashboard/stores/volume'
import { computedAsync, useColorMode } from '@vueuse/core';
import path from 'path';
import { computed, shallowRef } from 'vue';

const volumeStore = useVolumeStore()
const colorMode = useColorMode()

const emits = defineEmits(['close'])

const currentEntry = computedAsync(() => {
    return volumeStore.data.entries.find(entry => entry.relative_path === volumeStore.activeViewEntryRelativePath);
});

const currentLanguage = computed(() => {
    return volumeStore.activeViewEntryRelativePath?.endsWith('.css') ? 'css' : 'javascript';
});


const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: false,
    formatOnPaste: false,
    fontSize: 14,
};


/** @type {?import('monaco-editor').editor.IStandaloneCodeEditor} */
const editorElementRef = shallowRef();

const entryValue = computed({
    get() {
        return currentEntry.value?.content || '';
    },
    set(val) {
        if (currentEntry.value) {
            currentEntry.value.content = val;
        }
    }
});

const editorReadOnly = computed(() => {
    return currentEntry.value?.handler === 'read-only';
});


function doSave() {

}



function naturalExpand(value, total = null) {
    const length = typeof total === 'number' ? total.toString().length : 8
    return ('0'.repeat(length) + value).slice(-length)
}

function handleEditorMount(editor, monaco) {
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
                                    description: 'Theme variables are special CSS variables defined using the `@theme` directive that influence which utility classes exist in your project.',
                                    references: [
                                        {
                                            name: 'Docs: Theme variables',
                                            url: 'https://tailwindcss.com/docs/theme'
                                        }
                                    ],
                                },
                                {
                                    name: '@plugin',
                                    status: 'standard',
                                    description: 'Use the `@plugin` directive to load a legacy JavaScript-based plugin.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#plugin-directive',
                                        },
                                        {
                                            name: 'Docs: Tailwind CSS plugins',
                                            url: 'https://wind.press/docs/configuration/file-main-css#tailwind-css-plugins',
                                        },
                                    ],
                                },
                                {
                                    name: '@config',
                                    status: 'standard',
                                    description: 'Use the `@config` directive to load a legacy JavaScript-based configuration file.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#config-directive',
                                        },
                                        {
                                            name: 'Docs: Tailwind CSS configuration',
                                            url: 'https://wind.press/docs/configuration/file-main-css#tailwind-css-configuration',
                                        }
                                    ],
                                },
                                {
                                    name: '@tailwind',
                                    status: 'standard',
                                    description: 'Use the `@tailwind` directive to insert Tailwind\'s `base`, `components`, `utilities` and `variants` styles into your CSS.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://v3.tailwindcss.com/docs/functions-and-directives#tailwind',
                                        },
                                    ],
                                },
                                {
                                    name: '@apply',
                                    status: 'standard',
                                    description: 'Use `@apply` to inline any existing utility classes into your own custom CSS.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#apply-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@utility',
                                    status: 'standard',
                                    description: 'Use the `@utility` directive to add custom utilities to your project that work with variants like `hover`, `focus` and `lg``.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#utility-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@custom-variant',
                                    status: 'standard',
                                    description: 'Use the `@custom-variant` directive to add a custom variant in your project.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#custom-variant-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@variant',
                                    status: 'standard',
                                    description: 'Use the `@variant` directive to apply a Tailwind variant to styles in your CSS.',
                                    references: [
                                        {
                                            name: 'Docs: Functions & Directives',
                                            url: 'https://tailwindcss.com/docs/functions-and-directives#variant-directive',
                                        },
                                    ],
                                },
                                {
                                    name: '@source',
                                    status: 'standard',
                                    description: 'Use the `@source` directive to scan additional source files.',
                                    references: [
                                        {
                                            name: 'Docs: Scanning additional Sources',
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

            let variables = [];

            if (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 4) {
                variables = (await getVariableList({ volume: volumeStore.getKVEntries(), })).map(entry => {
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
        label: 'Save',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
            doSave();
        }
    });
}





</script>

<template>
    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="currentEntry?.relative_path" :toggle="false">
            <template #leading>
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emits('close')" />
            </template>

            <template #title>
                <UIcon :name="`vscode-icons:file-type-${currentEntry?.relative_path === 'main.css' ? 'tailwind' : path.extname(currentEntry?.relative_path ?? '').replace('.', '')}`" class="size-5" />
                {{ currentEntry?.relative_path }}
            </template>

            <template #right>
                <UTooltip text="Save">
                    <UButton icon="i-lucide-save" color="neutral" variant="ghost" @click="doSave" />
                </UTooltip>
                
                <!-- <UTooltip text="Archive">
                    <UButton icon="i-lucide-inbox" color="neutral" variant="ghost" />
                </UTooltip>

                <UTooltip text="Reply">
                    <UButton icon="i-lucide-reply" color="neutral" variant="ghost" />
                </UTooltip> -->

                <!-- <UDropdownMenu :items="dropdownItems">
                    <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                </UDropdownMenu> -->
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto">
            <vue-monaco-editor v-model:value="entryValue" :language="currentLanguage" :saveViewState="false" :options="{ ...MONACO_EDITOR_OPTIONS, readOnly: editorReadOnly }" @mount="handleEditorMount" :theme="colorMode === 'dark' ? 'vs-dark' : 'vs'" />
        </div>

    </UDashboardPanel>
</template>