<script setup lang="ts">
import { ref, computed, watch, nextTick, shallowRef, type ComponentPublicInstance } from 'vue'
import { __ } from '@wordpress/i18n'
import { useVolumeStore, type Entry } from '@/dashboard/stores/volume'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useColorMode } from '@vueuse/core'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import path from 'path'

dayjs.extend(relativeTime)

const colorMode = useColorMode()

const props = defineProps<{
    entry: Entry
}>()

const volumeStore = useVolumeStore()
const toast = useToast()

const isOpen = defineModel<boolean>('open', { default: false })
const versions = ref<any[]>([])
const isLoading = ref(false)
const selectedVersion = ref<number | null>(null)
const previewContent = ref<string>('')
const previousVersionContent = ref<string>('')
const isLoadingPreview = ref(false)

// Monaco diff editor
let diffEditorContainer: HTMLElement | null = null
const diffEditor = shallowRef<monacoEditor.editor.IStandaloneDiffEditor | null>(null)
let isDisposing = false
let isInitializing = false

// Callback ref to capture the container element
function setDiffEditorContainer(el: Element | ComponentPublicInstance | null) {
    if (el instanceof HTMLElement) {
        diffEditorContainer = el
        // Trigger initialization when container is mounted
        nextTick(() => {
            initializeDiffEditor()
        })
    } else if (el === null) {
        diffEditorContainer = null
    }
}

// Get file language from extension
function getFileLanguage(filePath: string): string {
    const ext = path.extname(filePath).replace('.', '')
    if (ext === 'css') return 'css'
    if (ext === 'js') return 'javascript'
    if (ext === 'json') return 'json'
    return 'plaintext'
}

// Safely dispose the diff editor
function disposeDiffEditor() {
    if (!diffEditor.value || isDisposing) return

    isDisposing = true
    try {
        // Clear models first to detach them
        diffEditor.value.setModel(null)

        // Only dispose the editor, not the models
        // Monaco will handle model cleanup internally
        diffEditor.value.dispose()
    } catch {
        // Silently ignore disposal errors
    } finally {
        diffEditor.value = null
        isDisposing = false
    }
}

// Initialize Monaco diff editor
async function initializeDiffEditor() {
    // Prevent concurrent initializations
    if (isInitializing) {
        return
    }

    if (!diffEditorContainer || previewContent.value === null) {
        return
    }

    // Ensure we have a valid HTMLElement
    if (!(diffEditorContainer instanceof HTMLElement)) {
        return
    }

    isInitializing = true

    try {
        const language = getFileLanguage(props.entry.relative_path)
        const theme = colorMode.value === 'dark' ? 'vs-dark' : 'vs'

        // If editor exists, just update the models instead of recreating
        if (diffEditor.value) {
            // Create new models first (before disposing old ones to avoid race conditions)
            const originalModel = monacoEditor.editor.createModel(
                previousVersionContent.value,
                language
            )
            const modifiedModel = monacoEditor.editor.createModel(
                previewContent.value,
                language
            )

            // Get old models to dispose after setting new ones
            const currentModel = diffEditor.value.getModel()
            const oldOriginal = currentModel?.original
            const oldModified = currentModel?.modified

            // Set new models (this detaches old models)
            diffEditor.value.setModel({
                original: originalModel,
                modified: modifiedModel,
            })

            // Now dispose old models asynchronously to avoid blocking Monaco's async tasks
            setTimeout(() => {
                try {
                    if (oldOriginal && !oldOriginal.isDisposed()) oldOriginal.dispose()
                    if (oldModified && !oldModified.isDisposed()) oldModified.dispose()
                } catch (e) {
                    // Ignore disposal errors
                }
            }, 100)

            return
        }

        // Create new diff editor
        diffEditor.value = monacoEditor.editor.createDiffEditor(diffEditorContainer, {
            theme,
            readOnly: true,
            renderSideBySide: true,
            automaticLayout: true,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            diffWordWrap: 'on',
            renderOverviewRuler: false,
        })

        // Create models
        // Original (left) = Previous version (or empty for version 1)
        // Modified (right) = Selected version
        const originalModel = monacoEditor.editor.createModel(
            previousVersionContent.value,
            language
        )
        const modifiedModel = monacoEditor.editor.createModel(
            previewContent.value,
            language
        )

        // Set models
        diffEditor.value.setModel({
            original: originalModel,
            modified: modifiedModel,
        })
    } finally {
        // Always reset the flag
        isInitializing = false
    }
}

// Watch for slideover opening
watch(isOpen, async (newValue) => {
    if (newValue) {
        loadVersions()
    } else {
        // Reset state first
        selectedVersion.value = null
        previewContent.value = ''
        previousVersionContent.value = ''

        // Then dispose editor after DOM updates
        await nextTick()
        disposeDiffEditor()
        diffEditorContainer = null
    }
})

// Watch for theme changes
watch(colorMode, () => {
    if (diffEditor.value) {
        monacoEditor.editor.setTheme(colorMode.value === 'dark' ? 'vs-dark' : 'vs')
    }
})

// Watch for content changes to update the editor
watch([previewContent, previousVersionContent], () => {
    if (diffEditorContainer && previewContent.value !== null && previewContent.value !== '') {
        nextTick(() => {
            initializeDiffEditor()
        })
    }
})

// Load versions when slideover opens
async function loadVersions() {
    if (!props.entry?.relative_path) {
        return
    }

    isLoading.value = true

    try {
        const result = await volumeStore.getVersions(props.entry.relative_path)
        versions.value = result.versions || []
    } catch (error: any) {
        toast.add({
            title: __('Error', 'windpress'),
            description: error.message || __('Failed to load version history', 'windpress'),
            color: 'error',
        })
    } finally {
        isLoading.value = false
    }
}

// Load version content for preview (always expand, no toggle)
async function previewVersion(version: number) {
    // Always show the preview, just switch to different version
    selectedVersion.value = version
    isLoadingPreview.value = true

    try {
        // Load the selected version content
        const result = await volumeStore.getVersionContent(props.entry.relative_path, version)
        previewContent.value = result.content || ''

        // Load the previous version content (or empty for version 1)
        const previousVersion = version - 1
        if (previousVersion > 0) {
            const previousResult = await volumeStore.getVersionContent(props.entry.relative_path, previousVersion)
            previousVersionContent.value = previousResult.content || ''
        } else {
            // Version 1 has no previous version, compare with empty
            previousVersionContent.value = ''
        }
    } catch (error: any) {
        console.error('[VersionHistory] Error loading version:', error)
        toast.add({
            title: __('Error', 'windpress'),
            description: error.message || __('Failed to load version content', 'windpress'),
            color: 'error',
        })
        selectedVersion.value = null
    } finally {
        isLoadingPreview.value = false
    }
}

// Restore selected version
async function restoreVersion(version: number) {
    if (!confirm(__('Are you sure you want to restore this version? Current changes will be saved as a new version.', 'windpress'))) {
        return
    }

    isLoading.value = true

    try {
        await volumeStore.restoreVersion(props.entry.relative_path, version)

        toast.add({
            title: __('Version Restored', 'windpress'),
            description: __('The file has been restored successfully.', 'windpress'),
            color: 'success',
        })

        isOpen.value = false
        selectedVersion.value = null
    } catch (error: any) {
        toast.add({
            title: __('Error', 'windpress'),
            description: error.message || __('Failed to restore version', 'windpress'),
            color: 'error',
        })
    } finally {
        isLoading.value = false
    }
}

// Format timestamp
function formatTimestamp(timestamp: number) {
    return dayjs.unix(timestamp).fromNow()
}

function formatFullTimestamp(timestamp: number) {
    return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// Format file size
function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Get version type and display info
function getVersionType(message: string) {
    if (message.includes('External modification')) {
        return {
            icon: 'i-lucide-folder-sync',
            color: 'warning' as const,
            label: __('External Change', 'windpress'),
            description: __('Modified outside dashboard (FTP/Git/SSH)', 'windpress')
        }
    }
    if (message.includes('Restored from')) {
        return {
            icon: 'i-lucide-rotate-ccw',
            color: 'info' as const,
            label: __('Restored Version', 'windpress'),
            description: __('Restored from previous version', 'windpress')
        }
    }
    if (message.includes('Before save')) {
        return {
            icon: 'i-lucide-archive',
            color: 'neutral' as const,
            label: __('Auto Backup', 'windpress'),
            description: __('Automatic backup before manual save', 'windpress')
        }
    }
    return {
        icon: 'i-lucide-save',
        color: 'neutral' as const,
        label: __('Manual Save', 'windpress'),
        description: __('Saved from dashboard', 'windpress')
    }
}

// Close preview
function closePreview() {
    selectedVersion.value = null
    previewContent.value = ''
    previousVersionContent.value = ''

    // Dispose editor when closing preview
    nextTick(() => {
        disposeDiffEditor()
        diffEditorContainer = null
    })
}

const currentVersion = computed(() => {
    return versions.value.length > 0 ? versions.value[versions.value.length - 1] : null
})
</script>

<template>
    <div>
        <!-- Trigger Button -->
        <UTooltip :text="__('Version History', 'windpress')">
            <UButton
                icon="i-lucide-history"
                variant="ghost"
                size="sm"
                color="neutral"
                @click="isOpen = true"
            />
        </UTooltip>

        <!-- Slideover -->
        <USlideover v-model:open="isOpen" @after-enter="loadVersions" :ui="{ content: 'top-(--wp-admin--admin-bar--height) bottom-0' }">
            <template #content>
                <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-default">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-history" class="size-5 text-muted" />
                        <div>
                            <h2 class="text-base font-semibold text-highlighted">
                                {{ __('Version History', 'windpress') }}
                            </h2>
                            <p class="text-sm text-muted">
                                {{ entry.relative_path }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-auto">
                    <!-- Loading state -->
                    <div v-if="isLoading" class="flex items-center justify-center h-64">
                        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
                    </div>

                    <!-- Empty state -->
                    <div v-else-if="versions.length === 0" class="flex flex-col items-center justify-center h-64 gap-3">
                        <UIcon name="i-lucide-inbox" class="size-12 text-muted" />
                        <div class="text-center">
                            <p class="text-base font-medium text-highlighted">
                                {{ __('No version history', 'windpress') }}
                            </p>
                            <p class="text-sm text-muted">
                                {{ __('Versions will appear here after you save changes', 'windpress') }}
                            </p>
                        </div>
                    </div>

                    <!-- Version list -->
                    <div v-else class="divide-y divide-default">
                        <div
                            v-for="version in [...versions].reverse()"
                            :key="version.version"
                            class="p-4 hover:bg-muted transition-colors"
                            :class="{
                                'bg-elevated': selectedVersion === version.version
                            }"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-start gap-3 flex-1 min-w-0">
                                    <!-- Icon -->
                                    <UIcon
                                        :name="getVersionType(version.message).icon"
                                        :class="`size-5 text-${getVersionType(version.message).color}`"
                                    />

                                    <!-- Info -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-sm font-medium text-highlighted">
                                                {{ __('Version', 'windpress') }} {{ version.version }}
                                            </span>
                                            <!-- <UBadge
                                                v-if="version.version === currentVersion?.version"
                                                size="xs"
                                                color="primary"
                                            >
                                                {{ __('Current', 'windpress') }}
                                            </UBadge> -->
                                            <UBadge
                                                size="xs"
                                                :color="getVersionType(version.message).color"
                                                variant="outline"
                                            >
                                                {{ getVersionType(version.message).label }}
                                            </UBadge>
                                        </div>

                                        <p class="text-sm text-muted mb-1" :title="getVersionType(version.message).description">
                                            {{ getVersionType(version.message).description }}
                                        </p>

                                        <p v-if="version.message !== 'Before save' && version.message !== 'External modification detected'" class="text-xs text-default mb-2 italic">
                                            "{{ version.message }}"
                                        </p>

                                        <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
                                            <span :title="formatFullTimestamp(version.timestamp)">
                                                <UIcon name="i-lucide-clock" class="size-3 inline" />
                                                {{ formatTimestamp(version.timestamp) }}
                                            </span>
                                            <span v-if="version.user">
                                                <UIcon name="i-lucide-user" class="size-3 inline" />
                                                {{ version.user }}
                                            </span>
                                            <span>
                                                <UIcon name="i-lucide-file" class="size-3 inline" />
                                                {{ formatSize(version.size) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="flex items-center gap-2">
                                    <UButton
                                        icon="i-lucide-eye"
                                        size="xs"
                                        variant="ghost"
                                        :color="selectedVersion === version.version ? 'primary' : 'neutral'"
                                        :title="__('Preview this version', 'windpress')"
                                        @click="previewVersion(version.version)"
                                    />
                                    <UButton
                                        v-if="version.version !== currentVersion?.version"
                                        icon="i-lucide-rotate-ccw"
                                        size="xs"
                                        variant="ghost"
                                        color="neutral"
                                        :title="__('Restore this version', 'windpress')"
                                        :disabled="isLoading"
                                        @click.stop="restoreVersion(version.version)"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Preview area (fixed at bottom, always visible when a version is selected) -->
                    <div v-if="selectedVersion !== null" class="border-t border-default bg-elevated">
                        <div class="p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-eye" class="size-4 text-muted" />
                                    <span class="text-sm font-medium text-highlighted">
                                        {{ __('Previewing Version', 'windpress') }} {{ selectedVersion }}
                                    </span>
                                </div>
                                <UButton
                                    icon="i-lucide-x"
                                    size="xs"
                                    variant="soft"
                                    color="neutral"
                                    @click="closePreview"
                                >
                                    {{ __('Close Preview', 'windpress') }}
                                </UButton>
                            </div>

                            <!-- Loading overlay -->
                            <div v-show="isLoadingPreview" class="flex items-center justify-center py-8">
                                <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-muted" />
                                <span class="text-xs text-muted ml-2">{{ __('Loading...', 'windpress') }}</span>
                            </div>

                            <!-- Editor container - always rendered to preserve ref, hidden when loading -->
                            <div v-show="!isLoadingPreview" class="overflow-hidden rounded-lg border border-default">
                                <div class="flex items-center justify-between px-3 py-2 bg-elevated border-b border-default">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-git-compare" class="size-3 text-muted" />
                                        <span class="text-xs font-medium text-muted uppercase">{{ __('Diff View', 'windpress') }}</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-xs text-muted">
                                        <div class="flex items-center gap-1">
                                            <span v-if="selectedVersion && selectedVersion > 1">
                                                {{ __('Version', 'windpress') }} {{ selectedVersion - 1 }}
                                            </span>
                                            <span v-else>
                                                {{ __('Empty', 'windpress') }}
                                            </span>
                                        </div>
                                        <span>vs</span>
                                        <div class="flex items-center gap-1">
                                            <span>{{ __('Version', 'windpress') }} {{ selectedVersion }}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Container is always rendered to preserve the ref -->
                                <div :ref="setDiffEditorContainer" class="h-96"></div>
                            </div>
                        </div>

                        <!-- Temp placeholder to keep structure -->
                        <div style="display: none">
                            <div
                                v-for="version in [...versions].reverse()"
                                :key="version.version"
                            >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="border-t border-default px-4 py-3">
                    <div class="flex items-center justify-between text-xs text-muted">
                        <span>
                            {{ versions.length }} {{ versions.length === 1 ? __('version', 'windpress') : __('versions', 'windpress') }}
                        </span>
                        <span v-if="currentVersion">
                            {{ __('Last updated', 'windpress') }} {{ formatTimestamp(currentVersion.timestamp) }}
                        </span>
                    </div>
                </div>
                </div>
            </template>
        </USlideover>
    </div>
</template>
