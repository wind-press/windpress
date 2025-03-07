<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useVolumeStore } from '@/dashboard/stores/volume'

import type { TreeItem } from '@nuxt/ui'
import type { Entry } from '@/dashboard/stores/volume'
import path from 'path'

const volumeStore = useVolumeStore()

const items: TreeItem[] = [
    {
        label: 'components/',
        defaultExpanded: true,
        onSelect: (e: Event) => {
            e.preventDefault()
        },
        children: [
            {
                label: 'commons/',
                defaultExpanded: true,
                children: [
                    { label: 'card.css', icon: 'vscode-icons:file-type-css' },
                    { label: 'button.css', icon: 'vscode-icons:file-type-css' }
                ]
            },
            {
                label: 'woocommerce/',
                defaultExpanded: true,
                children: [
                    { label: 'pagination.css', icon: 'vscode-icons:file-type-css' },
                    { label: 'accordion.css', icon: 'vscode-icons:file-type-css' }
                ]
            },
        ]
    },
    { label: 'main.css', icon: 'vscode-icons:file-type-tailwind' },
    { label: 'tailwind.config.js', icon: 'vscode-icons:file-type-js-official' },
    { label: 'theme.css', icon: 'vscode-icons:file-type-css' },
    { label: 'wizard.css', icon: 'vscode-icons:file-type-css', children: [] },
    // {
    //     label: 'windpress/',
    //     defaultExpanded: true,
    //     onSelect: (e: Event) => {
    //         e.preventDefault()
    //     },
    //     children: [{
    //         label: 'composables/',
    //         children: [
    //             { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
    //             { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
    //         ]
    //     },
    //     {
    //         label: 'components/',
    //         defaultExpanded: true,
    //         children: [
    //             { label: 'Card.vue', icon: 'i-vscode-icons-file-type-vue' },
    //             { label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }
    //         ]
    //     }]
    // },
    // { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
    // { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' },
]

const selectedFilePath = ref<TreeItem | undefined>(undefined)

watch(selectedFilePath, (value) => {
    volumeStore.activeViewEntryRelativePath = value?.value
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
            onSelect: (e: Event) => {
                console.log('selected', entry.relative_path)
            }
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
});

onMounted(() => {
    if (!volumeStore.data.entries.length) {
        volumeStore.doPull();
    }
});
</script>

<template>
    <div class="overflow-y-auto divide-y divide-(--ui-border)">
        <UTree :items="files" v-model="selectedFilePath" />
    </div>
</template>