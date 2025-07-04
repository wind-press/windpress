<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { unrefElement } from '@vueuse/core'
import type { TreeItem } from '@nuxt/ui'

// Local implementation of attach instruction functionality
function attachInstruction(data: any, config: any) {
    const { input, element, indentPerLevel, currentLevel } = config

    // Calculate drop zone based on pointer position
    const rect = element.getBoundingClientRect()
    const relativeY = input.clientY - rect.top
    const relativeX = input.clientX - rect.left
    const height = rect.height

    // Determine instruction type based on position
    let instructionType = 'reorder-below'

    // Top third = reorder above
    if (relativeY < height * 0.33) {
        instructionType = 'reorder-above'
    }
    // Bottom third = reorder below  
    else if (relativeY > height * 0.67) {
        instructionType = 'reorder-below'
    }
    // Middle third + indented = make child
    else if (relativeX > indentPerLevel * 2) {
        instructionType = 'make-child'
    }
    // Middle third without indent = reorder below
    else {
        instructionType = 'reorder-below'
    }

    return {
        ...data,
        instruction: {
            type: instructionType,
            currentLevel,
            indentPerLevel
        }
    }
}

function extractInstruction(data: any) {
    return data.instruction || null
}

const props = defineProps<{
    item: TreeItem
    level: number
    hasChildren: boolean
    isLast: boolean
    // Add a prop to pass the tree checking function from parent
    isDescendantOf?: (sourceId: string, targetId: string) => boolean
}>()

const outerDropZoneRef = ref<HTMLElement>()
const dropZoneRef = ref<HTMLElement>()
const draggableRef = ref<HTMLElement>()
const isDragging = ref(false)
const isDraggedOver = ref(false)
const instruction = ref<any>(null)

watchEffect((onCleanup) => {
    const outerDropZone = unrefElement(outerDropZoneRef)
    const dropZone = unrefElement(dropZoneRef)
    const draggableElement = unrefElement(draggableRef)
    if (!outerDropZone || !dropZone || !draggableElement) return

    const itemData = {
        id: props.item.value,
        level: props.level
    }

    // Find the drag handle within the draggable element
    const dragHandle = draggableElement.querySelector('.drag-and-drop-handler') as HTMLElement

    if (!dragHandle) {
        console.warn('No drag handle found for item:', props.item.value)
        return
    }

    const dndFunction = combine(
        // Make only the drag handle draggable
        draggable({
            element: dragHandle,
            getInitialData: () => {
                console.log('Dragging item:', itemData)
                return itemData
            },
            onGenerateDragPreview: ({ nativeSetDragImage }) => {
                // Create a custom drag preview that includes nested items
                if (nativeSetDragImage) {
                    // Create a preview container
                    const previewContainer = document.createElement('div')

                    previewContainer.className = 'bg-default border border-default rounded-lg p-2 shadow-lg opacity-90 max-w-md font-sans'

                    // Clone the current item content
                    const itemClone = draggableElement.cloneNode(true) as HTMLElement
                    
                    itemClone.className = 'm-0 py-2 px-0 [&_*]:!bg-default [&_*]:!text-highlighted'

                    previewContainer.appendChild(itemClone)

                    // Add children if they exist
                    if (props.hasChildren && props.item.children?.length) {
                        const childrenContainer = document.createElement('div')
                        childrenContainer.className = 'ml-4 pl-2 border-l-2 border-default'

                        // Add a label for children count
                        const childLabel = document.createElement('div')
                        childLabel.className = 'text-sm text-dimmed py-1'
                        childLabel.textContent = `+ ${props.item.children.length} nested item${props.item.children.length > 1 ? 's' : ''}`
                        childrenContainer.appendChild(childLabel)

                        previewContainer.appendChild(childrenContainer)
                    }

                    // Temporarily add to DOM for measurement
                    document.body.appendChild(previewContainer)

                    // Calculate offset relative to drag handle
                    const handleRect = dragHandle.getBoundingClientRect()

                    const offsetX = handleRect.width / 2
                    const offsetY = handleRect.height / 2

                    nativeSetDragImage(previewContainer, offsetX, offsetY)

                    // Clean up after a short delay
                    setTimeout(() => {
                        if (document.body.contains(previewContainer)) {
                            document.body.removeChild(previewContainer)
                        }
                    }, 100)
                }
            },
            onDragStart: () => {
                console.log('Drag started for item:', props.item.value)
                isDragging.value = true
            },
            onDrop: () => {
                console.log('Drag ended for item:', props.item.value)
                isDragging.value = false
            },
        }),

        // Make the outer drop zone wrapper element a drop target (one level up)
        dropTargetForElements({
            element: outerDropZone,
            getData: ({ input, element }) => {
                const data = { id: props.item.value }
                console.log('Getting drop data for:', props.item.value)
                return attachInstruction(data, {
                    input,
                    element,
                    indentPerLevel: 16,
                    currentLevel: props.level,
                    block: [],
                })
            },
            canDrop: ({ source }) => {
                const sourceId = source.data.id as string
                const targetId = props.item.value as string

                // Cannot drop on itself
                if (sourceId === targetId) {
                    console.log('Cannot drop on self:', targetId)
                    return false
                }

                // Cannot drop on its own children (would destroy the item)
                if (props.isDescendantOf) {
                    const isDescendant = props.isDescendantOf(sourceId, targetId)
                    if (isDescendant) {
                        console.log('Cannot drop on descendant:', sourceId, '->', targetId)
                        return false
                    }
                }

                console.log('Can drop on', targetId, '?', true)
                return true
            },
            onDrag: ({ self }) => {
                instruction.value = extractInstruction(self.data)
                console.log('Drag over item:', props.item.value, 'instruction:', instruction.value)
            },
            onDragEnter: ({ source }) => {
                console.log('Drag enter item:', props.item.value, 'from:', source.data.id)
                if (source.data.id !== props.item.value) {
                    isDraggedOver.value = true
                }
            },
            onDragLeave: () => {
                console.log('Drag leave item:', props.item.value)
                isDraggedOver.value = false
                instruction.value = null
            },
            onDrop: ({ source }) => {
                console.log('Drop on item:', props.item.value, 'from:', source.data.id)
                isDraggedOver.value = false
                instruction.value = null
            },
            getIsSticky: () => true,
        }),
    )

    onCleanup(() => dndFunction())
})
</script>

<template>
    <!-- Outer drop zone wrapper (one level up) for better drop targeting -->
    <div ref="outerDropZoneRef" class="relative w-full px-2.5 py-1.5 transition-all duration-200 ease-out" :class="{
        'bg-elevated': isDraggedOver
    }">
        <!-- Drop indicator on the outer drop zone -->
        <div v-if="instruction" class="absolute pointer-events-none border-primary transition-all duration-150 ease-out" :class="{
            '!border-b-2 -bottom-px left-1 right-0': instruction.type === 'reorder-below',
            '!border-t-2 -top-px left-1 right-0': instruction.type === 'reorder-above',
            '!border-2 rounded top-0 bottom-0 bg-primary/10 w-full -left-px': instruction.type === 'make-child',
        }" />

        <!-- Small circle indicators for reorder operations -->
        <div v-if="instruction && (instruction.type === 'reorder-below' || instruction.type === 'reorder-above')" class="absolute pointer-events-none w-2 h-2 border-2 border-primary bg-transparent rounded-full -left-1 z-10 transition-all duration-150 ease-out" :class="{
            '-bottom-1': instruction.type === 'reorder-below',
            '-top-1': instruction.type === 'reorder-above',
        }" />

        <!-- Text indicator for make-child instruction -->
        <div v-if="instruction && instruction.type === 'make-child'" class="absolute text-primary pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-medium whitespace-nowrap z-10 transition-all duration-150 ease-out">
            Drop to nest inside
        </div>

        <!-- Inner drop zone wrapper adapted to Nuxt UI Tree's styling -->
        <div ref="dropZoneRef" class="relative w-full transition-all duration-200 ease-out">
            <!-- Draggable content wrapper with tree item button styling -->
            <div ref="draggableRef" class="relative w-full py-4 transition-all duration-200 ease-out" :class="{
                'is-being-dragged': isDragging
            }">
                <slot />
            </div>
        </div>
    </div>
</template>
