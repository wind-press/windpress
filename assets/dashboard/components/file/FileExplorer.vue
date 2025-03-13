<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useVolumeStore } from '@/dashboard/stores/volume'
import path from 'path'

import type { TreeItem } from '@nuxt/ui'

import type { Entry } from '@/dashboard/stores/volume'

const volumeStore = useVolumeStore()

const selectedFilePath = ref<TreeItem | undefined>(undefined)

watch(selectedFilePath, (value) => {
    volumeStore.activeViewEntryRelativePath = value?.value ?? null
})

function recursiveTreeNodeWalkAndInsert(trees: TreeItem[], entry: Entry, rootPath?: string) {
    const relativePath = rootPath ? path.relative(rootPath, entry.relative_path) : entry.relative_path;
    const parts = relativePath.split('/');
    const currentPart = parts.shift();
    const isFile = parts.length === 0;

    if (isFile) {
        trees.push({
            label: currentPart,
            value: entry.relative_path,
            icon: `vscode-icons:file-type-${entry.relative_path === 'main.css' ? 'tailwind' : path.extname(entry.relative_path).replace('.', '')}`,
            slot: entry.relative_path !== 'main.css' ? 'tree-file' : undefined,
        });
        return;
    }

    let tree = trees.find(tree => tree.label === currentPart);

    if (!tree) {
        tree = {
            label: currentPart,
            children: [],
            onSelect: (e: Event) => {
                e.preventDefault()
            }
        };
        trees.push(tree);
    }

    recursiveTreeNodeWalkAndInsert(tree.children || (tree.children = []), entry, rootPath ? path.join(rootPath, currentPart || '') : currentPart || '');
}

const files = computed(() => {
    let trees: TreeItem[] = []

    volumeStore.data.entries.forEach((entry: Entry) => {
        if (entry.hidden) {
            return;
        }

        recursiveTreeNodeWalkAndInsert(trees, entry);
    })

    // sort the trees to have folders first
    trees.sort((a, b) => {
        if (a.children && !b.children) {
            return -1;
        }
        if (!a.children && b.children) {
            return 1;
        }

        return a.label && b.label ? a.label.localeCompare(b.label) : 0;
    });

    return trees
})

watch(() => volumeStore.activeViewEntryRelativePath, (value) => {
    if (!value) {
        selectedFilePath.value = undefined;
        return;
    }

    switchToEntry(value)
})

function switchToEntry(value: string) {
    // walk the tree and select the file
    const walk = (tree: TreeItem) => {
        if (tree.value === value) {
            selectedFilePath.value = tree;
            return true;
        }

        if (tree.children) {
            for (const child of tree.children) {
                if (walk(child)) {
                    return true;
                }
            }
        }

        return false;
    }

    for (const tree of files.value) {
        if (walk(tree)) {
            break;
        }
    }
}

onMounted(() => {
    if (volumeStore.activeViewEntryRelativePath) {
        switchToEntry(volumeStore.activeViewEntryRelativePath)
    }
});
</script>

<template>
    <div class="overflow-y-auto divide-y divide-(--ui-border)">
        <UTree :items="files" v-model="selectedFilePath" />
    </div>
</template>