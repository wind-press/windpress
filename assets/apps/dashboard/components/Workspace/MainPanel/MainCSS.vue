<script setup>
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { ref, shallowRef, onBeforeMount, toRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUIStore } from '@/dashboard/stores/ui.js';
import { useTailwindStore } from '@/dashboard/stores/tailwind.js';

import twTheme from 'tailwindcss/theme.css?inline';
import { build, optimize, find_tw_candidates } from '@/packages/tailwind/index.js';

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
    twStore.doPush();
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




        // tryBuild();


        // const candidates = find_tw_candidates(/** html */`
        //     <!--
        //     Welcome to Tailwind Play, the official Tailwind CSS playground!

        //     Everything here works just like it does when you're running Tailwind locally
        //     with a real build pipeline. You can customize your config file, use features
        //     like , or even add third-party plugins.

        //     Feel free to play with this example if you're just learning, or trash it and
        //     start from scratch if you know enough to be dangerous. Have fun!
        //     -->
        //     <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
        //     <img src="/img/beams.jpg" alt="" class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" width="1308" />
        //     <div class="absolute inset-0 bg-[url(/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        //     <div class="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
        //         <div class="mx-auto max-w-md">
        //         <img src="/img/logo.svg" class="h-6" alt="Tailwind Play" />
        //         <div class="divide-y divide-gray-300/50">
        //             <div class="space-y-6 py-8 text-base leading-7 text-gray-600">
        //             <p>An advanced online playground for Tailwind CSS, including support for things like:</p>
        //             <ul class="space-y-4">
        //                 <li class="flex items-center">
        //                 <svg class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
        //                     <circle cx="12" cy="12" r="11" />
        //                     <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
        //                 </svg>
        //                 <p class="ml-4">
        //                     Customizing your
        //                     <code class="text-sm font-bold text-gray-900">tailwind.config.js</code> file
        //                 </p>
        //                 </li>
        //                 <li class="flex items-center">
        //                 <svg class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
        //                     <circle cx="12" cy="12" r="11" />
        //                     <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
        //                 </svg>
        //                 <p class="ml-4">
        //                     Extracting classes with
        //                     <code class="text-sm font-bold text-gray-900">@apply</code>
        //                 </p>
        //                 </li>
        //                 <li class="flex items-center">
        //                 <svg class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
        //                     <circle cx="12" cy="12" r="11" />
        //                     <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
        //                 </svg>
        //                 <p class="ml-4">Code completion with instant preview</p>
        //                 </li>
        //             </ul>
        //             <p>Perfect for learning how the framework works, prototyping a new idea, or creating a demo to share online.</p>
        //             </div>
        //             <div class="pt-8 text-base font-semibold leading-7">
        //             <p class="text-gray-900">Want to dig deeper into Tailwind?</p>
        //             <p>
        //                 <a href="https://tailwindcss.com/docs" class="text-sky-500 hover:text-sky-600">Read the docs &rarr;</a>
        //             </p>
        //             </div>
        //         </div>
        //         </div>
        //     </div>
        //     </div>
        // `);

        // console.log('candidates', candidates);


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

    // TODO: Register custom completion provider
    monaco.languages.registerCompletionItemProvider('css', {
        provideCompletionItems(model, position) {
            const wordInfo = model.getWordUntilPosition(position)

            const theme = twTheme + twStore.data.main_css.current
            const design = __unstable__loadDesignSystem(theme)

            const variables = Array.from(design.theme.entries()).map(
                (entry, index) => {
                    const variable = entry[0]

                    const defaultValue = entry[1].value
                    const calculatedValue = `${parseFloat(defaultValue) * 16}px`

                    const isCalculated = defaultValue.includes('rem')
                    const isColor = variable.includes('--color')

                    return {
                        kind: isColor
                            ? monaco.languages.CompletionItemKind.Color
                            : monaco.languages.CompletionItemKind.Variable,
                        label: variable,
                        insertText: variable,
                        detail: isCalculated
                            ? calculatedValue
                            : defaultValue,
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: wordInfo.startColumn,
                            endLineNumber: position.lineNumber,
                            endColumn: wordInfo.endColumn
                        },
                        sortText: naturalExpand(index)
                    }
                }
            )

            return {
                suggestions: variables
            }
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

async function tryBuild() {
    console.log('tryBuild', twStore.data.main_css.current);

    const result = await build({
        candidates: ['bg-yellow-100', 'font-bold', 'text-center'],
        entrypoint: '/main.css',
        volume: {
            '/main.css': twStore.data.main_css.current,
        }
    });

    const normal = await optimize(result);

    console.log('optimize', normal);
}
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