<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { inject, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { nanoid, customAlphabet } from 'nanoid';

import type { TreeItem, DropdownMenuItem } from '@nuxt/ui';
import { type WizardTheme } from '@/dashboard/composables/useWizard';

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

// Convert the tree items back to the breakpoint structure
function treeToBreakpoint(items: TreeItem[]): WizardTheme['namespaces']['breakpoint'] {
    const breakpoint: WizardTheme['namespaces']['breakpoint'] = {};

    items.forEach(item => {
        if (!item.var.key) return; // Skip items without labels

        if (item.children && item.children.length > 0) {
            breakpoint[item.var.key] = {
                ...treeToBreakpoint(item.children),
            };

            // If the item has a value (including empty string), we can set it as $value
            if (item.var.value !== undefined && item.var.value !== null) {
                breakpoint[item.var.key].$value = item.var.value;
            }
        } else if (item.var.value !== undefined && item.var.value !== null) {
            breakpoint[item.var.key] = item.var.value;
        }
    });

    console.log('Converted tree to breakpoint:', breakpoint);

    return breakpoint;
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
    const newBreakpoint = treeToBreakpoint(items.value);
    console.log('Setting new breakpoint:', newBreakpoint);
    // theme.value.namespaces.breakpoint = newBreakpoint;

    theme.value.namespaces.breakpoint = newBreakpoint;
    console.log('Updated theme from items:', theme.value.namespaces.breakpoint);
}

// Find the current item by uid
function findItemByUid(items: TreeItem[], targetUid: string): TreeItem | undefined {
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
    function findParentItem(items: TreeItem[], target: TreeItem): TreeItem | undefined {
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
        items.value.splice(items.value.indexOf(currentItem) + 1, 0, newBreakpoint);
    }
}

onBeforeMount(() => {
    // Initialize items from theme
    items.value = breakpointToTree(theme.value.namespaces.breakpoint);
    console.log('Initialized items from theme:', items.value);
});

// onBeforeUnmount(() => {
//     console.log('Before unmounting, updating theme from items...');
//     // Save the theme when unmounting
//     // console.log('Saving theme on unmount:', theme.value.namespaces.breakpoint);
//     updateThemeFromItems();
// });

onBeforeRouteLeave((to, from, next) => {
    console.log('Before route leave, updating theme from items...');
    // Save the theme when leaving the route
    updateThemeFromItems();
    next();
});


// watch(selected, (newSelected) => {
//     console.log('Selected items changed:', newSelected);
//     // You can handle selected items here if needed
// }, { deep: true });
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
            <UTree :items :ui="{ link: 'py-4' }" :default-expanded="expandedTree">
                <template #item="{ item }">
                    <div class="bg-elevated rounded p-1 hover:bg-accented cursor-grab">
                        <UIcon name="lucide:grip-vertical" class="size-4 text-dimmed" />
                    </div>
                    <div>
                        <UInput v-model="item.var.key" @update:model-value="(val) => {
                            // Only allow alphanumeric characters, hyphens, and underscores
                            const sanitized = val.replace(/[^a-zA-Z0-9\-_]/g, '');
                            item.var.key = sanitized;
                        }" placeholder="" :ui="{ base: 'peer' }">
                            <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                                <span class="inline-flex bg-default px-1">{{ i18n.__('Name') }}</span>
                            </label>
                        </UInput>
                    </div>
                    <div class="w-full">
                        <UInput v-model="item.var.value" @update:model-value="(value) => { item.var.value = value }" placeholder="" :ui="{ base: 'peer', root: 'block' }">
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
                                    addBreakpointNext(item.value);
                                },
                            },
                            {
                                label: i18n.__('Add (child)', 'windpress'),
                                icon: 'lucide:corner-down-right',
                                onSelect() {
                                    addBreakpointChild(item.value);
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
                </template>
            </UTree>
        </div>

    </UDashboardPanel>
</template>