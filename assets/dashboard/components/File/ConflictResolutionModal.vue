<script setup lang="ts">
// TODO: Future - This conflict resolution modal is currently disabled on the backend
// The backend (Volume.php) has conflict detection commented out to prevent infinite 409 loops.
// To re-enable conflict resolution:
// 1. Fix the version_token logic to properly handle optimistic concurrency
// 2. Uncomment the conflict detection code in Volume.php (lines ~295-304)
// 3. Test the full conflict resolution flow:
//    - Edit file in dashboard
//    - Modify same file externally (FTP/Git/SSH)
//    - Save from dashboard → should show this modal
//    - Choose resolution → should save successfully
//    - Make another change → should save without 409 errors
// 4. Consider implementing three-way merge for better conflict resolution

import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick, shallowRef, type ComponentPublicInstance } from 'vue'
import { __ } from '@wordpress/i18n'
import { useVolumeStore, type Conflict } from '@/dashboard/stores/volume'
import { useColorMode } from '@vueuse/core'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import path from 'path'

type MonacoEditor = typeof monacoEditor

const volumeStore = useVolumeStore()
const toast = useToast()
const colorMode = useColorMode()

const isOpen = ref(false)
const conflicts = ref<Conflict[]>([])
const currentConflictIndex = ref(0)
const resolution = ref<'yours' | 'theirs'>('yours')

// Monaco diff editor
let diffEditorContainer: HTMLElement | null = null
const diffEditor = shallowRef<monacoEditor.editor.IStandaloneDiffEditor | null>(null)

// Callback ref to capture the container element
function setDiffEditorContainer(el: Element | ComponentPublicInstance | null) {
    if (el instanceof HTMLElement) {
        diffEditorContainer = el
        if (currentConflict.value) {
            // Initialize editor when container is mounted
            nextTick(() => {
                initializeDiffEditor()
            })
        }
    } else if (el === null) {
        diffEditorContainer = null
    }
}

const currentConflict = computed(() => conflicts.value[currentConflictIndex.value])
const hasMultipleConflicts = computed(() => conflicts.value.length > 1)
const isLastConflict = computed(() => currentConflictIndex.value === conflicts.value.length - 1)

// Get file language from extension
function getFileLanguage(filePath: string): string {
    const ext = path.extname(filePath).replace('.', '')
    if (ext === 'css') return 'css'
    if (ext === 'js') return 'javascript'
    if (ext === 'json') return 'json'
    return 'plaintext'
}

// Initialize Monaco diff editor
async function initializeDiffEditor() {
    if (!diffEditorContainer || !currentConflict.value) {
        return
    }

    // Ensure we have a valid HTMLElement
    if (!(diffEditorContainer instanceof HTMLElement)) {
        return
    }

    // Dispose existing editor
    if (diffEditor.value) {
        diffEditor.value.dispose()
    }

    const language = getFileLanguage(currentConflict.value.path)
    const theme = colorMode.value === 'dark' ? 'vs-dark' : 'vs'

    // Create diff editor
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
    const originalModel = monacoEditor.editor.createModel(
        currentConflict.value.disk_content,
        language
    )
    const modifiedModel = monacoEditor.editor.createModel(
        currentConflict.value.your_content,
        language
    )

    // Set models
    diffEditor.value.setModel({
        original: originalModel,
        modified: modifiedModel,
    })
}

// Listen for conflict events
function handleConflicts(event: CustomEvent) {
    conflicts.value = event.detail.conflicts || []

    if (conflicts.value.length > 0) {
        currentConflictIndex.value = 0
        resolution.value = 'yours'
        isOpen.value = true

        // Editor will be initialized by the callback ref when container is mounted
    }
}

// Watch for conflict changes
watch(currentConflictIndex, () => {
    if (isOpen.value) {
        nextTick(() => {
            initializeDiffEditor()
        })
    }
})

// Watch for theme changes
watch(colorMode, () => {
    if (diffEditor.value) {
        monacoEditor.editor.setTheme(colorMode.value === 'dark' ? 'vs-dark' : 'vs')
    }
})

onMounted(() => {
    window.addEventListener('windpress:conflicts', handleConflicts as EventListener)
})

onBeforeUnmount(() => {
    window.removeEventListener('windpress:conflicts', handleConflicts as EventListener)

    // Dispose diff editor
    if (diffEditor.value) {
        diffEditor.value.dispose()
    }
})

// Navigate conflicts
function nextConflict() {
    if (currentConflictIndex.value < conflicts.value.length - 1) {
        currentConflictIndex.value++
        resolution.value = 'yours'
    }
}

function previousConflict() {
    if (currentConflictIndex.value > 0) {
        currentConflictIndex.value--
        resolution.value = 'yours'
    }
}

// Calculate SHA256 checksum
async function calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

// Resolve conflict
async function resolveConflict() {
    if (!currentConflict.value) return

    const entry = volumeStore.data.entries.find(e => e.relative_path === currentConflict.value.path)
    if (!entry) return

    // Update entry based on resolution
    if (resolution.value === 'yours') {
        // Use the editor content from the conflict snapshot
        entry.content = currentConflict.value.your_content
        // IMPORTANT: Use disk_checksum as version_token to acknowledge current disk state
        // This tells the server "I know the disk has this checksum, but I want to overwrite with my content"
        entry.version_token = currentConflict.value.disk_checksum
    } else {
        // Use disk version - content matches disk so use disk checksum
        entry.content = currentConflict.value.disk_content
        entry.version_token = currentConflict.value.disk_checksum
    }

    // Remove current conflict from list
    conflicts.value.splice(currentConflictIndex.value, 1)

    // If there are more conflicts, move to next
    if (conflicts.value.length > 0) {
        if (currentConflictIndex.value >= conflicts.value.length) {
            currentConflictIndex.value = conflicts.value.length - 1
        }
        resolution.value = 'yours'
    } else {
        // All conflicts resolved, close modal and try saving again
        isOpen.value = false

        toast.add({
            title: __('Conflicts Resolved', 'windpress'),
            description: __('All conflicts have been resolved. Saving...', 'windpress'),
            color: 'success',
        })

        // Trigger save again
        try {
            const result = await volumeStore.doPush()

            if (result.success) {
                // Pull fresh data from server to get updated version_tokens
                await volumeStore.doPull()

                toast.add({
                    title: __('Saved', 'windpress'),
                    description: __('Your changes have been saved successfully.', 'windpress'),
                    color: 'success',
                })
            } else {
                // Show the conflicts again
                if ('conflicts' in result && result.conflicts && result.conflicts.length > 0) {
                    conflicts.value = result.conflicts
                    currentConflictIndex.value = 0
                    resolution.value = 'yours'
                }
            }
        } catch (error: any) {
            toast.add({
                title: __('Error', 'windpress'),
                description: error.message || __('Failed to save after resolving conflicts', 'windpress'),
                color: 'error',
            })
        }
    }
}

// Resolve all with same strategy
async function resolveAllConflicts(strategy: 'yours' | 'theirs') {
    for (const conflict of conflicts.value) {
        const entry = volumeStore.data.entries.find(e => e.relative_path === conflict.path)
        if (!entry) continue

        if (strategy === 'yours') {
            entry.content = conflict.your_content
            // IMPORTANT: Use disk_checksum as version_token to acknowledge current disk state
            entry.version_token = conflict.disk_checksum
        } else {
            entry.content = conflict.disk_content
            entry.version_token = conflict.disk_checksum
        }
    }

    conflicts.value = []
    isOpen.value = false

    toast.add({
        title: __('Conflicts Resolved', 'windpress'),
        description: __('All conflicts resolved. Saving...', 'windpress'),
        color: 'success',
    })

    // Save again
    try {
        const result = await volumeStore.doPush()
        if (result.success) {
            // Pull fresh data from server to get updated version_tokens
            await volumeStore.doPull()

            toast.add({
                title: __('Saved', 'windpress'),
                description: __('Changes saved successfully.', 'windpress'),
                color: 'success',
            })
        }
    } catch (error: any) {
        toast.add({
            title: __('Error', 'windpress'),
            description: error.message || __('Failed to save', 'windpress'),
            color: 'error',
        })
    }
}

</script>

<template>
    <UModal v-model:open="isOpen" :prevent-close="true">
        <template #content>
            <div class="flex flex-col h-[80vh]">
                <!-- Header -->
                <div class="px-6 py-4 border-b border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-alert-triangle" class="size-5 text-warning" />
                            <h2 class="text-lg font-semibold text-highlighted">
                                {{ __('Resolve Conflicts', 'windpress') }}
                            </h2>
                        </div>
                        <UBadge v-if="hasMultipleConflicts" color="warning">
                            {{ currentConflictIndex + 1 }} / {{ conflicts.length }}
                        </UBadge>
                    </div>

                    <p class="text-sm text-muted">
                        {{ __('The following file was modified externally while you were editing. Choose which version to keep:', 'windpress') }}
                    </p>

                    <div class="mt-3 flex items-center gap-2">
                        <UIcon name="i-lucide-file" class="size-4 text-muted" />
                        <code class="text-sm text-highlighted font-mono">{{ currentConflict?.path }}</code>
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-hidden flex flex-col">
                    <!-- Resolution options -->
                    <div class="px-6 py-4 bg-muted border-b border-default">
                        <div class="grid grid-cols-2 gap-3">
                            <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors" :class="resolution === 'yours' ? 'border-primary bg-primary/5' : 'border-default hover:border-muted'">
                                <input
                                    v-model="resolution"
                                    type="radio"
                                    value="yours"
                                    class="mt-1"
                                />
                                <div class="flex-1">
                                    <div class="font-medium text-highlighted">
                                        {{ __('Keep Editor Version', 'windpress') }}
                                    </div>
                                    <div class="text-sm text-muted">
                                        {{ __('Use your changes from the editor', 'windpress') }}
                                    </div>
                                </div>
                            </label>

                            <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors" :class="resolution === 'theirs' ? 'border-primary bg-primary/5' : 'border-default hover:border-muted'">
                                <input
                                    v-model="resolution"
                                    type="radio"
                                    value="theirs"
                                    class="mt-1"
                                />
                                <div class="flex-1">
                                    <div class="font-medium text-highlighted">
                                        {{ __('Keep Disk Version', 'windpress') }}
                                    </div>
                                    <div class="text-sm text-muted">
                                        {{ __('Use the file from disk (FTP/Git/SSH)', 'windpress') }}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Monaco diff preview -->
                    <div class="flex-1 overflow-hidden flex flex-col">
                        <div class="px-4 py-2 bg-elevated border-b border-default">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-git-compare" class="size-4 text-muted" />
                                    <div class="text-xs font-medium text-muted uppercase">
                                        {{ __('Changes Preview', 'windpress') }}
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-muted">
                                    <div class="flex items-center gap-1">
                                        <div class="w-3 h-3 bg-error/20 border border-error/40 rounded"></div>
                                        <span>{{ __('Disk', 'windpress') }}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <div class="w-3 h-3 bg-success/20 border border-success/40 rounded"></div>
                                        <span>{{ __('Editor', 'windpress') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div :ref="setDiffEditorContainer" class="flex-1 min-h-0"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 border-t border-default bg-elevated">
                    <div class="flex items-center justify-between gap-3">
                        <!-- Navigation (if multiple conflicts) -->
                        <div v-if="hasMultipleConflicts" class="flex items-center gap-2">
                            <UButton
                                icon="i-lucide-chevron-left"
                                variant="ghost"
                                size="sm"
                                :disabled="currentConflictIndex === 0"
                                @click="previousConflict"
                            >
                                {{ __('Previous', 'windpress') }}
                            </UButton>
                            <UButton
                                icon="i-lucide-chevron-right"
                                trailing
                                variant="ghost"
                                size="sm"
                                :disabled="isLastConflict"
                                @click="nextConflict"
                            >
                                {{ __('Next', 'windpress') }}
                            </UButton>
                        </div>
                        <div v-else />

                        <!-- Actions -->
                        <div class="flex items-center gap-2">
                            <UButton
                                v-if="hasMultipleConflicts"
                                variant="outline"
                                size="sm"
                                @click="resolveAllConflicts(resolution)"
                            >
                                {{ __('Apply to All', 'windpress') }}
                            </UButton>
                            <UButton
                                color="primary"
                                size="sm"
                                @click="resolveConflict"
                            >
                                {{ isLastConflict ? __('Resolve & Save', 'windpress') : __('Resolve & Next', 'windpress') }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
