<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { inject, onBeforeMount, ref, watch, type Ref, watchEffect } from 'vue';
import { nanoid, customAlphabet } from 'nanoid';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'

import type { TreeItem } from '@nuxt/ui';
import { type WizardTheme } from '@/dashboard/composables/useWizard';
import DraggableTreeItem from './DraggableTreeItem.vue';

// Define the Instruction type locally to avoid import issues
type Instruction = {
    type: 'reorder-above' | 'reorder-below' | 'make-child' | 'reparent'
    currentLevel?: number
    indentPerLevel?: number
    desiredLevel?: number
}

// Function to extract instruction from drop target data
function extractInstruction(data: any): Instruction | null {
    // The instruction should be attached by the hitbox library
    if (data.instruction) {
        return data.instruction
    }
    
    // Look for instruction in other possible properties
    if (data.type) {
        return {
            type: data.type,
            currentLevel: data.currentLevel,
            indentPerLevel: data.indentPerLevel,
            desiredLevel: data.desiredLevel
        }
    }
    
    return null
}

const theme = inject('theme') as Ref<WizardTheme>;

const randomId = () => customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)();

function generateId() {
    let id = randomId();

    while (id.match(/^\d/)) {
        id = randomId();
    }

    return `${id}`;
}


const expandedTree = ref<string[]>([]);
const draggedItemId = ref<string | null>(null);
const recentlyMovedItemId = ref<string | null>(null);

console.log('Screens page loaded', theme.value);

// Support nesting / recursive structure for breakpoints by adding it to the `children` property of each TreeItem.
function breakpointToTree(breakpoint: WizardTheme['namespaces']['breakpoint']): TreeItem[] {
    return Object.entries(breakpoint)
        .map(([key, value]) => {
            // skip if the key is $value
            if (key === '$value') {
                return null;
            }

            const item: TreeItem = {
                value: nanoid(7), // Generate a unique ID for each item
                var: {
                    key: key,
                    value: value,
                },
                defaultExpanded: true,
                onSelect: (e: Event) => {
                    e.preventDefault();
                },
                onToggle: (e: Event) => {
                    e.preventDefault();
                },
            };

            // If the value is an object, we can assume it has nested breakpoints
            if (typeof value === 'object' && value !== null) {
                // item.onToggle = (e: Event) => {
                //     e.preventDefault()
                // };

                item.children = breakpointToTree(value);

                // if the value has a $value property, we can use that as the value
                if (value.$value !== undefined) {
                    item.var.value = value.$value;
                } else {
                    item.var.value = ''; // Ensure empty string for parent items without explicit value
                }
            } else {
                item.var.value = value;
            }

            // add value to expandedTree
            if (item.value !== undefined) {
                expandedTree.value.push(item.value);
            }

            return item;
        })
        .filter((item): item is TreeItem => item !== null)
        ;
}

// Create a reactive ref for items
const items = ref<TreeItem[]>([]);

// Only watch theme changes and update items (one-way)
watch(() => theme.value.namespaces.breakpoint, () => {
    // items.value = breakpointToTree(theme.value.namespaces.breakpoint);
    const bp = breakpointToTree(theme.value.namespaces.breakpoint);
    // console.log('Updated items from theme:', bp);

    // Ensure the items are updated after the next DOM update cycle
    items.value = bp;
    console.log('Items updated from theme:', items.value);
}, { deep: true });

// Function to manually update theme when items change
function updateThemeFromItems() {
    try {
        // Simplified conversion to avoid type recursion issues
        const convertItem = (item: any): any => {
            if (!item.var?.key) return null;
            
            if (item.children && item.children.length > 0) {
                const result: any = {};
                item.children.forEach((child: any) => {
                    const converted = convertItem(child);
                    if (converted) {
                        Object.assign(result, converted);
                    }
                });
                
                if (item.var.value !== undefined && item.var.value !== null) {
                    result.$value = item.var.value;
                }
                
                return { [item.var.key]: result };
            } else if (item.var.value !== undefined && item.var.value !== null) {
                return { [item.var.key]: item.var.value };
            }
            return null;
        };

        const newBreakpoint: any = {};
        items.value.forEach((item: any) => {
            const converted = convertItem(item);
            if (converted) {
                Object.assign(newBreakpoint, converted);
            }
        });

        console.log('Setting new breakpoint:', newBreakpoint);
        theme.value.namespaces.breakpoint = newBreakpoint;
        console.log('Updated theme from items:', theme.value.namespaces.breakpoint);
    } catch (error) {
        console.error('Error updating theme from items:', error);
    }
}

// Find the current item by uid
function findItemByUid(items: any[], targetUid: string): any {
    for (const item of items) {
        if (item.value === targetUid) {
            return item;
        }
        if (item.children && item.children.length > 0) {
            const found = findItemByUid(item.children, targetUid);
            if (found) return found;
        }
    }
}

function addBreakpointChild(uid: string) {
    console.log('Adding breakpoint child for uid:', uid);

    const currentItem = findItemByUid(items.value, uid);
    if (!currentItem) {
        console.error('Item not found for uid:', uid);
        return;
    }

    // Create a new breakpoint item
    const newBreakpoint: TreeItem = {
        value: nanoid(7), // Generate a unique ID for the new item
        var: {
            key: `bp${generateId()}`, // Use a unique key for the new item
            value: '',
        },
        defaultExpanded: true,
        children: [],
        onSelect: (e: Event) => {
            e.preventDefault();
        },
        onToggle: (e: Event) => {
            e.preventDefault();
        },
    };

    // If the current item has children, add to its children
    if (currentItem.children) {
        currentItem.children.push(newBreakpoint);
    } else {
        // If it has no children, create an empty array and add the new breakpoint
        currentItem.children = [newBreakpoint];
    }
}

function addBreakpointNext(uid: string) {
    console.log('Adding breakpoint next to uid:', uid);

    const currentItem = findItemByUid(items.value, uid);
    if (!currentItem) {
        return;
    }

    // Create a new breakpoint item
    const newBreakpoint: TreeItem = {
        value: nanoid(7), // Generate a unique ID for the new item
        var: {
            key: `bp${generateId()}`, // Use a unique key for the new item
            value: '',
        },
        defaultExpanded: true,
        children: [],
        onSelect: (e: Event) => {
            e.preventDefault();
        },
        onToggle: (e: Event) => {
            e.preventDefault();
        },
    };

    // Helper function to find the parent of a given item
    function findParentItem(items: any[], target: any): any {
        for (const item of items) {
            if (item.children && item.children.includes(target)) {
                return item;
            }
            if (item.children) {
                const found = findParentItem(item.children, target);
                if (found) return found;
            }
        }
    }

    // find current item's parent and insert the new item as the next sibling of the current item
    const parentItem = findParentItem(items.value, currentItem);

    if (parentItem && parentItem.children) {
        const index = parentItem.children?.indexOf(currentItem);
        if (index !== undefined && index >= 0) {
            // Insert the new item after the current item
            parentItem.children.splice(index + 1, 0, newBreakpoint);
        }
    } else {
        // If no parent found, we can add the new item at the root level, next to the current item
        const currentIndex = (items.value as any[]).indexOf(currentItem);
        if (currentIndex >= 0) {
            (items.value as any[]).splice(currentIndex + 1, 0, newBreakpoint);
        }
    }
}

onBeforeMount(() => {
    // Initialize items from theme
    items.value = breakpointToTree(theme.value.namespaces.breakpoint);
    console.log('Initialized items from theme:', items.value);
});

// Watch for drag and drop operations
watchEffect((onCleanup) => {
    const dndFunction = combine(
        monitorForElements({
            onDrop(args) {
                const { location, source } = args
                // didn't drop on anything
                if (!location.current.dropTargets.length)
                    return

                const itemId = source.data.id as string
                const target = location.current.dropTargets[0]
                const targetId = target.data.id as string

                const instruction: Instruction | null = extractInstruction(target.data)

                if (instruction !== null) {
                    handleDragAndDrop(itemId, targetId, instruction)
                }
            },
        }),
    )

    onCleanup(() => {
        dndFunction()
    })
})

// onBeforeUnmount(() => {
//     console.log('Before unmounting, updating theme from items...');
//     // Save the theme when unmounting
//     // console.log('Saving theme on unmount:', theme.value.namespaces.breakpoint);
//     updateThemeFromItems();
// });

// Watch for drag and drop operations
watchEffect((onCleanup) => {
    console.log('Setting up drag and drop monitor')
    const dndFunction = combine(
        monitorForElements({
            onDragStart({ source }) {
                console.log('Global drag started:', source.data.id)
                draggedItemId.value = source.data.id as string
            },
            onDrop(args) {
                console.log('Global drop detected:', args)
                const { location, source } = args
                
                // Reset dragged item
                draggedItemId.value = null
                
                // didn't drop on anything
                if (!location.current.dropTargets.length) {
                    console.log('No drop targets found')
                    return
                }

                const itemId = source.data.id as string
                const target = location.current.dropTargets[0]
                const targetId = target.data.id as string

                console.log('Drop details:', { itemId, targetId, targetData: target.data })

                const instruction = extractInstruction(target.data)
                console.log('Extracted instruction:', instruction)

                if (instruction !== null) {
                    handleDragAndDrop(itemId, targetId, instruction)
                } else {
                    console.log('No instruction found, trying simple reorder')
                    // Fallback to simple reorder
                    handleDragAndDrop(itemId, targetId, { type: 'reorder-below' })
                }
            },
        }),
    )

    onCleanup(() => {
        console.log('Cleaning up drag and drop monitor')
        draggedItemId.value = null
        dndFunction()
    })
})

// Handle drag and drop operations
function handleDragAndDrop(itemId: string, targetId: string, instruction: Instruction) {
    console.log('Drag and drop:', { itemId, targetId, instruction })

    const sourceItem = findItemByUid(items.value, itemId)
    const targetItem = findItemByUid(items.value, targetId)

    if (!sourceItem || !targetItem) {
        console.error('Source or target item not found')
        return
    }

    // Remove the source item from its current location
    removeItem(items.value, itemId)

    // Insert the source item based on the instruction
    if (instruction.type === 'reorder-above') {
        insertBefore(items.value, targetId, sourceItem)
    } else if (instruction.type === 'reorder-below') {
        insertAfter(items.value, targetId, sourceItem)
    } else if (instruction.type === 'make-child') {
        insertChild(items.value, targetId, sourceItem)
    } else if (instruction.type === 'reparent') {
        const path = getPathToItem(items.value, targetId)
        if (path && instruction.desiredLevel !== undefined && path.length > instruction.desiredLevel) {
            const desiredParentId = path[instruction.desiredLevel]
            insertAfter(items.value, desiredParentId, sourceItem)
        }
    }

    // Update the theme after drag and drop
    updateThemeFromItems()

    // Show highlight effect for the moved item
    recentlyMovedItemId.value = itemId
    setTimeout(() => {
        recentlyMovedItemId.value = null
    }, 1000) // Remove highlight after 1 second
}

// Helper functions for tree manipulation
function removeItem(data: any[], id: string): boolean {
    for (let i = 0; i < data.length; i++) {
        if (data[i].value === id) {
            data.splice(i, 1)
            return true
        }
        if (data[i].children && removeItem(data[i].children!, id)) {
            return true
        }
    }
    return false
}

function insertBefore(data: any[], targetId: string, newItem: any): boolean {
    for (let i = 0; i < data.length; i++) {
        if (data[i].value === targetId) {
            data.splice(i, 0, newItem)
            return true
        }
        if (data[i].children && insertBefore(data[i].children!, targetId, newItem)) {
            return true
        }
    }
    return false
}

function insertAfter(data: any[], targetId: string, newItem: any): boolean {
    for (let i = 0; i < data.length; i++) {
        if (data[i].value === targetId) {
            data.splice(i + 1, 0, newItem)
            return true
        }
        if (data[i].children && insertAfter(data[i].children!, targetId, newItem)) {
            return true
        }
    }
    return false
}

function insertChild(data: any[], targetId: string, newItem: any): boolean {
    for (let i = 0; i < data.length; i++) {
        if (data[i].value === targetId) {
            if (!data[i].children) {
                data[i].children = []
            }
            data[i].children!.unshift(newItem)
            return true
        }
        if (data[i].children && insertChild(data[i].children!, targetId, newItem)) {
            return true
        }
    }
    return false
}

function getPathToItem(data: any[], targetId: string, parentIds: string[] = []): string[] | undefined {
    for (const item of data) {
        if (item.value === targetId) {
            return parentIds
        }
        if (item.children) {
            const result = getPathToItem(item.children, targetId, [...parentIds, item.value!])
            if (result) return result
        }
    }
    return undefined
}

// Helper function to check if targetId is a descendant of sourceId
function isDescendantOf(sourceId: string, targetId: string): boolean {
    const sourceItem = findItemByUid(items.value, sourceId)
    if (!sourceItem) return false
    
    // Recursively check if targetId exists in sourceItem's children
    function checkChildren(item: any): boolean {
        if (!item.children) return false
        
        for (const child of item.children) {
            if (child.value === targetId) {
                return true
            }
            if (checkChildren(child)) {
                return true
            }
        }
        return false
    }
    
    return checkChildren(sourceItem)
}

// Helper function to check if an item should be dimmed during drag
function shouldBeDimmed(itemId: string): boolean {
    if (!draggedItemId.value) return false
    
    // Dim the dragged item itself and all its descendants
    return itemId === draggedItemId.value || isDescendantOf(draggedItemId.value, itemId)
}

// Helper function to check if an item was recently moved
function wasRecentlyMoved(itemId: string): boolean {
    return recentlyMovedItemId.value === itemId
}

onBeforeRouteLeave((_, __, next) => {
    console.log('Before route leave, updating theme from items...');
    // Save the theme when leaving the route
    updateThemeFromItems();
    next();
});

// Handle right arrow key to ensure normal behavior in input fields
function handleLeftRightArrowKey(event: KeyboardEvent) {
    // Stop the event from bubbling up to parent elements
    event.stopPropagation();
    event.stopImmediatePropagation();
    // Don't prevent default - allow normal cursor movement
}
</script>

<template>
    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="i18n.__('Screens', 'wizard')" :toggle="false" :ui="{ title: 'text-sm' }">
            <template #title>
                <UIcon name="lucide:monitor-smartphone" class="size-5" />
                {{ i18n.__('Screens', 'wizard') }}
                <UBadge variant="soft" color="neutral">--breakpoint-*</UBadge>
                <UTooltip :text="i18n.__('Responsive breakpoint variants like sm:*', 'windpress')">
                    <span class="text-xs opacity-60 font-normal">
                        {{ i18n.__('Responsive breakpoint variants like sm:*', 'windpress') }}
                    </span>
                </UTooltip>
            </template>

            <template #right>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                    <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://tailwindcss.com/docs/responsive-design#customizing-your-theme" target="_blank" />
                </UTooltip>
            </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto p-4">
            <!-- TreeItem -->
            <UTree :items :ui="{ link: 'p-0' }" :default-expanded="expandedTree">
                <template #item="{ item, level }">
                    <DraggableTreeItem 
                        :item="item" 
                        :level="level || 0" 
                        :has-children="!!(item.children && item.children.length > 0)"
                        :is-last="false"
                        :is-descendant-of="isDescendantOf"
                        :class="{ 
                            'opacity-30': shouldBeDimmed(item.value || ''),
                            'ring-2 ring-primary ring-offset-2 bg-primary/5': wasRecentlyMoved(item.value || '')
                        }"
                        class="transition-all duration-300 ease-out rounded-lg"
                    >
                        <div class="flex items-center gap-2 w-full">
                            <div class="drag-and-drop-handler bg-elevated rounded p-1 hover:bg-accented cursor-grab">
                                <UIcon name="lucide:grip-vertical" class="size-4 text-dimmed" />
                            </div>
                            <div>
                                <UInput v-model="item.var.key" @update:model-value="(val) => {
                                    // Only allow alphanumeric characters, hyphens, and underscores
                                    const sanitized = val.replace(/[^a-zA-Z0-9\-_]/g, '');
                                    item.var.key = sanitized;
                                }" @keydown.left="handleLeftRightArrowKey" @keydown.right="handleLeftRightArrowKey" placeholder="" :ui="{ base: 'peer' }">
                                    <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                                        <span class="inline-flex bg-default px-1">{{ i18n.__('Name') }}</span>
                                    </label>
                                </UInput>
                            </div>
                            <div class="w-full">
                                <UInput v-model="item.var.value" @update:model-value="(value) => { item.var.value = value }" @keydown.left="handleLeftRightArrowKey" @keydown.right="handleLeftRightArrowKey" placeholder="" :ui="{ base: 'peer', root: 'block' }">
                                    <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                                        <span class="inline-flex bg-default px-1">{{ i18n.__('Value') }}</span>
                                    </label>
                                </UInput>
                            </div>
                            <div>
                                <UDropdownMenu :items="[
                                    {
                                        label: i18n.__('Add (next)', 'windpress'),
                                        icon: 'i-lucide-plus',
                                        onSelect() {
                                            addBreakpointNext(item.value || '');
                                        },
                                    },
                                    {
                                        label: i18n.__('Add (child)', 'windpress'),
                                        icon: 'lucide:corner-down-right',
                                        onSelect() {
                                            addBreakpointChild(item.value || '');
                                        },
                                    },
                                    {
                                        label: 'Delete',
                                        icon: 'i-lucide-trash-2',
                                    }
                                ]" :ui="{
                                    content: 'w-48'
                                }">
                                    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
                                </UDropdownMenu>
                            </div>
                        </div>
                    </DraggableTreeItem>
                </template>
            </UTree>
        </div>

    </UDashboardPanel>
</template>