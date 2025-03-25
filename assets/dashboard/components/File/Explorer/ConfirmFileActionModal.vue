<script setup lang="ts">
import { codeToHtml } from 'shiki/bundle/web'
import path from 'path';
import { computedAsync, useColorMode } from '@vueuse/core';

const props = defineProps<{
    filePath: string,
    fileContent?: string,
    actionYes: string,
    actionNo?: string,
}>()

const colorMode = useColorMode()

const snippet = computedAsync(async () => {
    if (!props.fileContent) {
        return;
    }

    const fileExt = path.extname(props.filePath).replace('.', '');

    return codeToHtml(props.fileContent, {
        lang: fileExt === 'css' ? 'css' : 'javascript',
        theme: colorMode.value === 'dark' ? 'dark-plus' : 'light-plus',
    });
})

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }">
        <template #title>
            {{ i18n.sprintf(i18n.__('Are you sure you want to %s the "%s" file?', 'windpress'), actionYes, filePath) }}
        </template>

        <template #body v-if="fileContent">
            <Suspense>
                <div class="flex">
                    <div v-html="snippet" class="flex [&>pre]:p-4 [&>pre]:mr-6"></div>
                </div>
            </Suspense>
        </template>

        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" variant="soft" :label="i18n.__('cancel', 'windpress')" @click="emit('close', false)" class="capitalize" />
                <UButton color="error" variant="soft" :label="actionYes" @click="emit('close', true)" class="capitalize" />
            </div>
        </template>
    </UModal>
</template>
