<script setup lang="ts">
import dayjs from 'dayjs'
import { VolumeSFSFile } from '@/dashboard/composables/useFileAction';

const props = defineProps<{
    data: VolumeSFSFile,
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }">
        <template #title>
            Import SFS volume
        </template>

        <template #body>
            <div class="flex flex-col gap-4 text-(--ui-text)">
                <div>
                    <div class="font-bold uppercase my-2"> File info </div>

                    <table class="w-full">
                        <tbody>
                            <tr>
                                <td class="font-semibold w-1/3">WindPress version</td>
                                <td class="">:</td>
                                <td class="">{{ props.data._version }}</td>
                            </tr>
                            <tr>
                                <td class="font-semibold w-1/5">WP Version</td>
                                <td class="">:</td>
                                <td class="">{{ props.data._wp_version }}</td>
                            </tr>
                            <tr>
                                <td class="font-semibold w-1/5">Exported on</td>
                                <td class="">:</td>
                                <td class="">{{ dayjs(props.data._timestamp).format('YYYY-MM-DD HH:mm:ss') }}</td>
                            </tr>
                            <tr>
                                <td class="font-semibold w-1/5">Entries</td>
                                <td class="">:</td>
                                <td class="">{{ props.data.entries.length }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                This will overwrite all existing files. Are you sure you want to continue?
            </div>
        </template>

        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" variant="soft" label="cancel" @click="emit('close', false)" class="capitalize" />
                <UButton color="warning" variant="soft" label="Yes, continue" @click="emit('close', true)" class="capitalize" />
            </div>
        </template>
    </UModal>
</template>
