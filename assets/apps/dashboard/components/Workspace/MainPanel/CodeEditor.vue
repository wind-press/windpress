<script setup>
import { shallowRef, onBeforeMount, computed } from 'vue';
import { useUIStore } from '@/dashboard/stores/ui.js';
import { useNotifier } from '@/dashboard/library/notifier';
import { getVariableList } from '@/packages/core/tailwind';
import { useVolumeStore } from '@/dashboard/stores/volume';

const notifier = useNotifier();
const ui = useUIStore();
const volumeStore = useVolumeStore();

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
    // set the monaco editor content
    (async () => {
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
                                    description: 'The special `@theme` directive tells Tailwind to make new utilities and variants available based on those variables',
                                    references: [
                                        {
                                            name: 'Blog: Open-sourcing our progress on Tailwind CSS v4.0',
                                            url: 'https://tailwindcss.com/blog/tailwindcss-v4-alpha#:~:text=the%20special%20%40theme%20directive%20tells%20tailwind%20to%20make%20new%20utilities%20and%20variants%20available%20based%20on%20those%20variables'
                                        }
                                    ],
                                },
                                {
                                    name: '@plugin',
                                    status: 'standard',
                                    description: 'The special `@plugin` directive tells Tailwind to load a plugin',
                                    references: [
                                        {
                                            name: 'Twitter',
                                            url: 'https://x.com/adamwathan/status/1830716239381176647',
                                        },
                                        {
                                            name: 'GitHub PR: Support plugin options in CSS tailwindlabs/tailwindcss#14264',
                                            url: 'https://github.com/tailwindlabs/tailwindcss/pull/14264'
                                        },
                                        {
                                            name: 'GitHub PR: Support loading plugins in CSS tailwindlabs/tailwindcss-intellisense#1044',
                                            url: 'https://github.com/tailwindlabs/tailwindcss-intellisense/pull/1044'
                                        }
                                    ],
                                },
                                {
                                    name: '@config',
                                    status: 'standard',
                                    description: 'The special `@config` directive tells Tailwind to load a config',
                                    references: [
                                        {
                                            name: 'Twitter',
                                            url: 'https://x.com/adamwathan/status/1830716239381176647',
                                        },
                                        {
                                            name: 'GitHub PR: Support loading config files via @config tailwindlabs/tailwindcss#14239',
                                            url: 'https://github.com/tailwindlabs/tailwindcss/pull/14239'
                                        },
                                        {
                                            name: 'GitHub PR: Support loading plugins in CSS tailwindlabs/tailwindcss-intellisense#1044',
                                            url: 'https://github.com/tailwindlabs/tailwindcss-intellisense/pull/1044'
                                        }
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

            const variables = (await getVariableList({ volume: volumeStore.getKVEntries(), })).map(entry => {
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

    if (data.source === source && data.target === target && data.task === task) {
        doSave();
    }
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