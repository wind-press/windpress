<script setup lang="ts">
import { codeToHtml } from 'shiki/bundle/web'
import path from 'path';
import { computedAsync, useColorMode } from '@vueuse/core';
import { VolumeSFSFile } from '@/dashboard/composables/useFileAction';

const props = defineProps<{
    data: VolumeSFSFile,
}>()

const colorMode = useColorMode()

// const snippet = computedAsync(async () => {
//     if (!props.fileContent) {
//         return;
//     }

//     const fileExt = path.extname(props.filePath).replace('.', '');

//     return codeToHtml(props.fileContent, {
//         lang: fileExt === 'css' ? 'css' : 'javascript',
//         theme: colorMode.value === 'dark' ? 'dark-plus' : 'light-plus',
//     });
// })

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }">
        <template #title>
            Are you sure you want to {{ actionYes }} the <code>{{ filePath }}</code> file?
        </template>

        <template #body v-if="fileContent">
            <Suspense>
                <div class="flex">
                    <div v-html="snippet" class="flex [&>pre]:p-4 [&>pre]:mr-6" />
                </div>
            </Suspense>
        </template>

        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" variant="soft" label="cancel" @click="emit('close', false)" class="capitalize" />
                <UButton color="error" variant="soft" :label="actionYes" @click="emit('close', true)" class="capitalize" />
            </div>
        </template>
    </UModal>
</template>
