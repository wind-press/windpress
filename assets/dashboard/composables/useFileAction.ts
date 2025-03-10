import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import DeleteFileModal from '@/dashboard/components/file/Explorer/ContentMenu/DeleteFileModal.vue'

const volumeStore = useVolumeStore()
const toast = useToast()
const overlay = useOverlay()

async function deleteFile(entry: Entry) {
    if (entry.handler !== 'internal') {
        toast.add({
            title: `Error: File "${entry.relative_path}" is not deletable`,
            description: 'File are managed by external handler',
            color: 'error',
            id: 'delete-modal-not-deletable'
        })
        return;
    }

    if (entry.relative_path === 'main.css') {
        toast.add({
            title: `Error: File "${entry.relative_path}" is not deletable`,
            description: 'File is required for the Tailwind CSS to work',
            color: 'error',
            id: 'delete-modal-not-deletable'
        })
        return;
    }

    const deleteModal = overlay.create(DeleteFileModal, {
        destroyOnClose: true,
        props: {
            filePath: entry.relative_path,
            fileContent: entry.content
        },
    })

    const shouldDelete = await deleteModal.open()

    if (!shouldDelete) {
        toast.add({
            title: `Canceled: File "${entry.relative_path}" is not deleted`,
            color: 'info',
            id: 'delete-modal-dismissed'
        })
        return;
    }

    volumeStore.softDeleteEntry(entry)

    toast.add({
        title: `Success: File "${entry.relative_path}" deleted`,
        color: 'success',
        id: 'delete-modal-success'
    })
}

export function useFileAction() {
    return {
        deleteFile
    }
}