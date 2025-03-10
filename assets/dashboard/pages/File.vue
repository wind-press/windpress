<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import FileExplorer from '@/dashboard/components/file/FileExplorer.vue'
import FileEditor from '@/dashboard/components/file/FileEditor.vue'
import { useFileAction } from '@/dashboard/composables/useFileAction'

const volumeStore = useVolumeStore()
const fileAction = useFileAction()

const isFilePanelOpen = computed({
    get() {
        return !!volumeStore.activeViewEntryRelativePath
    },
    set(value: boolean) {
        if (!value) {
            volumeStore.activeViewEntryRelativePath = null
        }
    }
})

const currentEntry = computed<Entry>(() => {
    const entry = volumeStore.data.entries.find((entry: Entry) => entry.relative_path === volumeStore.activeViewEntryRelativePath);
    if (entry) {
        return entry;
    } else {
        throw new Error('Entry not found');
    }
});

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
    <UDashboardPanel id="explorer-1" :default-size="25" :min-size="20" :max-size="30" resizable class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar title="Explorer">
            <template #leading>
                <UDashboardSidebarCollapse />
            </template>

            <template #right>
                <UTooltip :delay-duration="0" text="Add new file">
                    <UButton color="primary" variant="subtle" icon="i-lucide-plus" />
                </UTooltip>

                <UTooltip :delay-duration="0" text="Export vfs">
                    <UButton color="neutral" variant="outline" icon="i-lucide-download" />
                </UTooltip>

                <UTooltip :delay-duration="0" text="Import vfs">
                    <UButton color="neutral" variant="outline" icon="i-lucide-upload" />
                </UTooltip>

            </template>
        </UDashboardNavbar>

        <FileExplorer />
    </UDashboardPanel>

    <FileEditor v-if="volumeStore.activeViewEntryRelativePath" @close="volumeStore.activeViewEntryRelativePath = null" :entry="currentEntry" @delete="(entry: Entry) => fileAction.deleteFile(entry)" @save="fileAction.save()" @reset="(entry: Entry) => fileAction.resetFile(entry)" />
    <div v-else class="hidden lg:flex flex-1 items-center justify-center">
        <UIcon name="lucide:file-pen" class="size-32 text-(--ui-text-dimmed)" />
    </div>

    <USlideover v-if="isMobile" v-model:open="isFilePanelOpen">
        <template #content>
            <!-- <FileEditor v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" /> -->
        </template>
    </USlideover>
</template>