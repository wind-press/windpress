<script setup lang="ts">
import { useVolumeStore } from '@/dashboard/stores/volume'
import { computedAsync } from '@vueuse/core';
import path from 'path';

const volumeStore = useVolumeStore()

const emits = defineEmits(['close'])

const currentEntry = computedAsync(() => {
    return volumeStore.data.entries.find(entry => entry.relative_path === volumeStore.activeViewEntryRelativePath);
});
</script>

<template>
    <UDashboardPanel id="explorer-2" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
        <UDashboardNavbar :title="currentEntry?.relative_path" :toggle="false" >
            <template #leading>
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emits('close')" />
            </template>

            <template #title>
                <UIcon :name="`vscode-icons:file-type-${currentEntry?.relative_path === 'main.css' ? 'tailwind' : path.extname(currentEntry?.relative_path ?? '').replace('.', '')}`" class="size-5" />
                {{  currentEntry?.relative_path }}
            </template>

            <template #right>
                <!-- <UTooltip text="Archive">
                    <UButton icon="i-lucide-inbox" color="neutral" variant="ghost" />
                </UTooltip>

                <UTooltip text="Reply">
                    <UButton icon="i-lucide-reply" color="neutral" variant="ghost" />
                </UTooltip> -->

                <!-- <UDropdownMenu :items="dropdownItems">
                    <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                </UDropdownMenu> -->
            </template>
        </UDashboardNavbar>

        <!-- <div class="flex flex-col sm:flex-row justify-between gap-1 p-4 sm:px-6 border-b border-(--ui-border)">
            <div class="flex items-start gap-4 sm:my-1.5">
                <UAvatar v-bind="mail.from.avatar" :alt="mail.from.name" size="3xl" />

                <div class="min-w-0">
                    <p class="font-semibold text-(--ui-text-highlighted)">
                        {{ mail.from.name }}
                    </p>
                    <p class="text-(--ui-text-muted)">
                        {{ mail.from.email }}
                    </p>
                </div>
            </div>

            <p class="max-sm:pl-16 text-(--ui-text-muted) text-sm sm:mt-2">
                {{ format(new Date(mail.date), 'dd MMM HH:mm') }}
            </p>
        </div> -->

        <!-- <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
            <p class="whitespace-pre-wrap">
                {{ mail.body }}
            </p>
        </div> -->

        <!-- <div class="pb-4 px-4 sm:px-6 shrink-0">
            <UCard variant="subtle" class="mt-auto" :ui="{ header: 'flex items-center gap-1.5 text-(--ui-text-dimmed)' }">
                <template #header>
                    <UIcon name="i-lucide-reply" class="size-5" />

                    <span class="text-sm truncate">
                        Reply to {{ mail.from.name }} ({{ mail.from.email }})
                    </span>
                </template>

                <form @submit.prevent="onSubmit">
                    <UTextarea v-model="reply" color="neutral" variant="none" required autoresize placeholder="Write your reply..." :rows="4" :disabled="loading" class="w-full" :ui="{ base: 'p-0 resize-none' }" />

                    <div class="flex items-center justify-between">
                        <UTooltip text="Attach file">
                            <UButton color="neutral" variant="ghost" icon="i-lucide-paperclip" />
                        </UTooltip>

                        <div class="flex items-center justify-end gap-2">
                            <UButton color="neutral" variant="ghost" label="Save draft" />
                            <UButton type="submit" color="neutral" :loading="loading" label="Send" icon="i-lucide-send" />
                        </div>
                    </div>
                </form>
            </UCard>
        </div> -->
    </UDashboardPanel>
</template>