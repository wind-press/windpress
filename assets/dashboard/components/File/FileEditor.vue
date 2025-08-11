<script setup lang="ts">
import { __ } from '@wordpress/i18n';
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useColorMode } from '@vueuse/core';
import path from 'path';
import { shallowRef } from 'vue';
import { getVariableList, loadDesignSystem, naturalExpand } from '@/packages/core/tailwindcss';

import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import Color from 'colorjs.io';

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
    editorElementRef.value = editor;

    if (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 4) {

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


        monaco.languages.registerCompletionItemProvider('css', {
            async provideCompletionItems(model, position) {
                const wordInfo = model.getWordUntilPosition(position);

                let variables: any[] = [];

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

                return {
                    suggestions: variables
                };
            }
        });

        // Register color provider for modern CSS color functions
        monaco.languages.registerColorProvider('css', {
            provideColorPresentations(_model, colorInfo) {
                const { red, green, blue, alpha } = colorInfo.color;
                const color = new Color('srgb', [red, green, blue], alpha);

                return [
                    {
                        label: color.toString({ format: 'hex' })
                    },
                    {
                        label: `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`
                    },
                    {
                        label: `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`
                    },
                    {
                        label: color.to('hsl').toString({ format: 'hsl' })
                    },
                    {
                        label: color.to('hwb').toString({ format: 'hwb' })
                    },
                    {
                        label: color.to('lch').toString({ format: 'lch' })
                    },
                    {
                        label: color.to('oklch').toString({ format: 'oklch' })
                    },
                    {
                        label: color.to('lab').toString({ format: 'lab' })
                    },
                    {
                        label: color.to('oklab').toString({ format: 'oklab' })
                    }
                ];
            },

            provideDocumentColors(model) {
                const colors: monacoEditor.languages.IColorInformation[] = [];
                const text = model.getValue();
                const processedRanges = new Set<string>(); // Track processed ranges to avoid duplicates

                // Helper function to parse and add color to the list
                const parseAndAddColor = (colorText: string, startIndex: number, endIndex: number) => {
                    // Create a unique key for this range
                    const rangeKey = `${startIndex}-${endIndex}`;
                    if (processedRanges.has(rangeKey)) {
                        return; // Already processed this exact range
                    }

                    try {
                        // Let Color.js handle all the parsing
                        const color = new Color(colorText.trim());

                        // Convert to sRGB for Monaco Editor
                        const srgb = color.to('srgb');
                        const [red, green, blue] = srgb.coords;

                        const startPosition = model.getPositionAt(startIndex);
                        const endPosition = model.getPositionAt(endIndex);

                        colors.push({
                            color: {
                                red: Math.max(0, Math.min(1, red ?? 0)),
                                green: Math.max(0, Math.min(1, green ?? 0)),
                                blue: Math.max(0, Math.min(1, blue ?? 0)),
                                alpha: srgb.alpha ?? 1
                            },
                            range: {
                                startLineNumber: startPosition.lineNumber,
                                startColumn: startPosition.column,
                                endLineNumber: endPosition.lineNumber,
                                endColumn: endPosition.column
                            }
                        });

                        processedRanges.add(rangeKey); // Mark this range as processed
                    } catch (error) {
                        // Skip invalid color values
                        console.warn('Invalid color format:', colorText, error);
                    }
                };

                // 1. Find colors in @theme blocks
                const themeBlockRegex = /@theme\s*\{([^}]*)\}/gs;
                let themeMatch;

                while ((themeMatch = themeBlockRegex.exec(text)) !== null) {
                    const themeContent = themeMatch[1];
                    const themeStartIndex = themeMatch.index + themeMatch[0].indexOf('{') + 1;

                    // Find all property values in the theme block that could be colors
                    const propertyRegex = /--[^:]+:\s*([^;]+);/g;
                    let propertyMatch;

                    while ((propertyMatch = propertyRegex.exec(themeContent)) !== null) {
                        const fullMatch = propertyMatch[0]; // e.g., "--color-primary: #007bff;"
                        const value = propertyMatch[1].trim(); // e.g., "#007bff"

                        // Find the actual position of the value in the original text
                        const propertyStartInTheme = propertyMatch.index;
                        const colonIndex = fullMatch.indexOf(':');
                        const valueStartInProperty = fullMatch.substring(colonIndex + 1).search(/\S/); // Find first non-whitespace after colon
                        const valueStartInTheme = propertyStartInTheme + colonIndex + 1 + valueStartInProperty;
                        const valueStart = themeStartIndex + valueStartInTheme;
                        const valueEnd = valueStart + value.length;

                        // Handle all colors in @theme blocks since Monaco's built-in provider 
                        // doesn't specifically look inside @theme blocks
                        parseAndAddColor(value, valueStart, valueEnd);
                    }
                }

                // 2. Find modern color functions outside @theme blocks that Monaco doesn't support by default
                // Only handle modern CSS color functions, let Monaco handle standard ones (rgb, hsl, hex, etc.)
                const colorPatterns = [
                    /\b(oklch|oklab|lch|lab)\(([^)]*(?!\bvar\b|\benv\b|\bcalc\b)[^)]*)\)/gi
                ];

                // Create a set of ranges that are inside @theme blocks to avoid duplicates
                const themeRanges: Array<{ start: number, end: number }> = [];
                const themeBlockRegexForRanges = /@theme\s*\{([^}]*)\}/gs;
                let themeRangeMatch;

                while ((themeRangeMatch = themeBlockRegexForRanges.exec(text)) !== null) {
                    const blockStart = themeRangeMatch.index;
                    const blockEnd = themeRangeMatch.index + themeRangeMatch[0].length;
                    themeRanges.push({ start: blockStart, end: blockEnd });
                }

                colorPatterns.forEach((pattern) => {
                    let match: RegExpExecArray | null;
                    while ((match = pattern.exec(text)) !== null) {
                        // Skip if contains variables or functions we don't want to process
                        if (match[0].includes('var(') || match[0].includes('env(') || match[0].includes('calc(')) {
                            continue;
                        }

                        // Check if this color is inside any @theme block
                        const isInsideThemeBlock = themeRanges.some(range =>
                            match!.index >= range.start && match!.index + match![0].length <= range.end
                        );

                        if (!isInsideThemeBlock) {
                            parseAndAddColor(match[0], match.index, match.index + match[0].length);
                        }
                    }
                    pattern.lastIndex = 0; // Reset regex state
                });

                return colors;
            }
        });

    }


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
        <UDashboardNavbar :title="entry?.relative_path" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #leading>
                <UTooltip :text="i18n.__('Close', 'windpress')">
                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emit('close')" />
                </UTooltip>
            </template>

            <template #title>
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
            </template>

            <template #right>
                <UTooltip v-if="entry?.relative_path !== 'main.css' && !(Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Delete', 'windpress')">
                    <UButton icon="i-lucide-trash" color="neutral" variant="ghost" @click="emit('delete', entry)" />
                </UTooltip>

                <UTooltip v-if="entry?.relative_path === 'main.css' || entry?.relative_path === 'wizard.css' || (Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value) === 3 && (entry?.relative_path === 'tailwind.config.js' || entry?.relative_path === 'wizard.js'))" :text="i18n.__('Reset to default', 'windpress')">
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