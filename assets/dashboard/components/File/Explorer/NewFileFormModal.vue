<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'

const volumeStore = useVolumeStore()

const emit = defineEmits<{ 
    close: [string?];
}>()

const filePath = ref<string>('')

const error = ref<string|boolean>(false)

watch(() => filePath.value, () => {
    error.value = false
})

function confirm() {
    error.value = false

    if (!filePath.value) {
        error.value = 'Filename is required'
        return
    }

    if (!filePath.value.endsWith('.css') && !filePath.value.endsWith('.js')) {
        error.value = 'File extension must be .css or .js'
        return
    }

    if (!/^[a-zA-Z0-9_.\-\/]+$/.test(filePath.value)) {
        error.value = 'Only alphanumeric, dash, underscore, forward slash, and dot are allowed'
        return
    }

    if (volumeStore.data.entries.find((entry: Entry) => entry.relative_path === `${filePath.value}` && entry.hidden !== true)) {
        error.value = `A file named "${filePath.value}" already exists`
        return
    }

    emit('close', filePath.value)
}

</script>

<template>
    <UModal :close="{ onClick: () => emit('close') }">
        <template #title>
            Create New File
        </template>

        <template #body>
            <UFormField label="Filename" required description="Filename may include a path. (css or js)" :error>
                <UInput v-model="filePath" placeholder="theme/color.css" class="w-full" />
            </UFormField>
        </template>

        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" variant="soft" label="cancel" @click="emit('close')" class="capitalize" />
                <UButton color="primary" variant="soft" label="Submit" @click="confirm" class="capitalize" />
            </div>
        </template>
    </UModal>
</template>
