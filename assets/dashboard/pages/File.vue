<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { Mail } from '../types'
import FileExplorer from '../components/file/FileExplorer.vue'
import FileEditor from '../components/file/FileEditor.vue'

const tabItems = [{
    label: 'All',
    value: 'all'
}, {
    label: 'Unread',
    value: 'unread'
}]
const selectedTab = ref('all')

const { data: mails } = useFetch('https://dashboard-template.nuxt.dev/api/mails', { initialData: [] }).json<Mail[]>()

// Filter mails based on the selected tab
const filteredMails = computed(() => {
    if (selectedTab.value === 'unread') {
        return mails.value?.filter(mail => !!mail.unread) ?? []
    }

    return mails.value ?? []
})

const selectedMail = ref<Mail | null>()

const isMailPanelOpen = computed({
    get() {
        return !!selectedMail.value
    },
    set(value: boolean) {
        if (!value) {
            selectedMail.value = null
        }
    }
})

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
    if (!filteredMails.value.find(mail => mail.id === selectedMail.value?.id)) {
        selectedMail.value = null
    }
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
    <UDashboardPanel id="explorer-1" :default-size="25" :min-size="20" :max-size="30" resizable class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar title="Explorer">
            <template #leading>
                <UDashboardSidebarCollapse />
            </template>
            <template #trailing>
                <!-- <UBadge :label="filteredMails.length" variant="subtle" /> -->
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

        <!-- <InboxList v-model="selectedMail" :mails="filteredMails" /> -->
        <FileExplorer v-model="selectedMail" :mails="filteredMails" />
    </UDashboardPanel>

    <FileEditor v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" />
    <div v-else class="hidden lg:flex flex-1 items-center justify-center">
        <UIcon name="lucide:file-pen" class="size-32 text-(--ui-text-dimmed)" />
    </div>

    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
        <template #content>
            <FileEditor v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" />
        </template>
    </USlideover>
</template>