<script setup>
import { shallowRef, onBeforeMount } from 'vue';
import { useUIStore } from '@/dashboard/stores/ui.js';
import { useTailwindStore } from '@/dashboard/stores/tailwind.js';
import { useNotifier } from '@/dashboard/library/notifier';

import twTheme from 'tailwindcss/theme.css?inline';
import { getVariableList } from '@/packages/core/tailwind';

const notifier = useNotifier();
const ui = useUIStore();
const twStore = useTailwindStore();

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: false,
    formatOnPaste: false,
    fontSize: 14,
};

/** @type {?import('monaco-editor').editor.IStandaloneCodeEditor} */
const editorCssRef = shallowRef();

function naturalExpand(value, total = null) {
    const length = typeof total === 'number' ? total.toString().length : 8
    return ('0'.repeat(length) + value).slice(-length)
}

function doSave() {
    const promise = twStore.doPush();

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        'Storing main.css...'
    );

    promise.finally(() => {
        channel.postMessage({
            source: 'windpress/dashboard',
            target: 'windpress/observer',
            task: 'windpress.main_css.saved',
            payload: {
                main_css: {
                    current: twStore.data.main_css.current,
                    init: twStore.data.main_css.init,
                }
            }
        });
    });
}

onBeforeMount(() => {
    // set the monaco editor content
    (async () => {
        if (twStore.data.main_css.init === null) {
            await twStore.doPull();
        }

        // if (Object.keys(settingsStore.options).length === 0) {
        //     await settingsStore.doPull();
        // }
    })();
});

function handleCssEditorMount(editor, monaco) {
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
                                }
                            ],
                        }
                    }
                }
            }
        )
    );

    editorCssRef.value = editor;

    monaco.languages.registerCompletionItemProvider('css', {
        provideCompletionItems(model, position) {
            const wordInfo = model.getWordUntilPosition(position);

            const theme = twTheme + twStore.data.main_css.current;

            const variables = getVariableList(theme).map(entry => {
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
    <vue-monaco-editor v-model:value="twStore.data.main_css.current" language="css" path="file:///main.css" :options="MONACO_EDITOR_OPTIONS" @mount="handleCssEditorMount" :theme="ui.virtualState('window.color-mode', 'light').value === 'light' ? 'vs' : 'vs-dark'" />
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