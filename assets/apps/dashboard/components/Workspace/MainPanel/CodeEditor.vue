<script setup>
import { shallowRef, onBeforeMount, computed, onUnmounted } from 'vue';
import { useUIStore } from '@/dashboard/stores/ui.js';
import { useNotifier } from '@/dashboard/library/notifier';
import { getInstanceId } from '@/dashboard/library/instance-id';
import { getVariableList } from '@/packages/core/tailwindcss-v4';
import { useVolumeStore } from '@/dashboard/stores/volume';
import { useSettingsStore } from '@/dashboard/stores/settings';

const notifier = useNotifier();
const ui = useUIStore();
const volumeStore = useVolumeStore();
const settingsStore = useSettingsStore();

if (Object.keys(settingsStore.options).length === 0) {
    await settingsStore.doPull();
}

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: false,
    formatOnPaste: false,
    fontSize: 14,
};

/** @type {?import('monaco-editor').editor.IStandaloneCodeEditor} */
const editorElementRef = shallowRef();

function doSave() {
    const promise = volumeStore.doPush();

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        'Storing data...'
    );

    promise
        .then(() => {
            volumeStore.doPull();
        })
        .finally(() => {
            channel.postMessage({
                source: 'windpress/dashboard',
                target: 'windpress/observer',
                task: 'windpress.code-editor.saved',
                payload: {
                    volume: volumeStore.getKVEntries()
                }
            });

            channel.postMessage({
                source: 'windpress/dashboard',
                target: 'windpress/dashboard',
                task: 'windpress.code-editor.saved',
                instanceId: getInstanceId(),
            });
        });
}

const currentEntry = computed(() => {
    return volumeStore.data.entries.find(entry => entry.relative_path === volumeStore.activeViewEntryRelativePath);
});

const currentLanguage = computed(() => {
    if (volumeStore.activeViewEntryRelativePath?.endsWith('.css')) {
        return 'css';
    } else if (volumeStore.activeViewEntryRelativePath?.endsWith('.js')) {
        return 'javascript';
    }

    return '';
});

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

onBeforeMount(() => {
    (async () => {
        // set the monaco editor content
        if (volumeStore.data.entries.length === 0) {
            await volumeStore.doPull();
        }
    })();
});

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
                            ],
                        }
                    }
                }
            }
        )
    );

    editorElementRef.value = editor;

    function naturalExpand(value, total = null) {
        const length = typeof total === 'number' ? total.toString().length : 8
        return ('0'.repeat(length) + value).slice(-length)
    }

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

const channel = new BroadcastChannel('windpress');
channel.addEventListener('message', (e) => {
    const data = e.data;
    const source = 'windpress/dashboard';
    const target = 'windpress/dashboard';
    const task = 'windpress.save';

    if (
        data.source === source
        && data.instanceId === getInstanceId()
        && data.target === target
        && data.task === task
    ) {
        doSave();
    }
});

channel.addEventListener('message', (e) => {
    const data = e.data;
    const source = 'windpress/dashboard';
    const target = 'windpress/dashboard';
    const task = 'windpress.code-editor.saved';

    if (
        data.source === source
        && data.instanceId !== getInstanceId()
        && data.target === target
        && data.task === task
    ) {
        volumeStore.doPull();
    }
});

onUnmounted(() => {
    channel.close();
});
</script>

<template>
    <vue-monaco-editor v-model:value="entryValue" :language="currentLanguage" :path="`file:///${volumeStore.activeViewEntryRelativePath}`" :options="{ ...MONACO_EDITOR_OPTIONS, readOnly: editorReadOnly }" @mount="handleEditorMount" :theme="ui.virtualState('window.color-mode', 'light').value === 'light' ? 'vs' : 'vs-dark'" />
</template>

<style lang="scss">
#windpress-app {
    .monaco-editor {
        .suggest-widget .monaco-list .monaco-list-row {
            &>.contents>.main {
                width: 100%;
            }

            .monaco-highlighted-label>.highlight {
                background-color: initial;
            }

            a:where(:not(.wp-element-button)) {
                text-decoration: none;
            }
        }
    }
}
</style>