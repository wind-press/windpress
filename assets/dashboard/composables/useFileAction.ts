import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import ConfirmFileModal from '@/dashboard/components/file/Explorer/ContentMenu/ConfirmFileModal.vue'

const volumeStore = useVolumeStore()
const toast = useToast()
const overlay = useOverlay()

async function deleteFile(entry: Entry) {
    if (entry.readonly) {
        toast.add({
            title: `Error: File "${entry.relative_path}" is not deletable`,
            description: 'File are read-only',
            color: 'error',
        })
        return;
    }

    if (entry.relative_path === 'main.css') {
        toast.add({
            title: `Error: File "${entry.relative_path}" is not deletable`,
            description: 'File is required for the Tailwind CSS to work',
            color: 'error',
        })
        return;
    }

    const deleteModal = overlay.create(ConfirmFileModal, {
        destroyOnClose: true,
        props: {
            filePath: entry.relative_path,
            fileContent: entry.content,
            actionYes: 'delete',
        },
    })

    const shouldDelete = await deleteModal.open()

    if (!shouldDelete) {
        toast.add({
            title: `Canceled: File "${entry.relative_path}" is not deleted`,
            color: 'info',
        })
        return;
    }

    volumeStore.softDeleteEntry(entry)

    toast.add({
        title: `Success: File "${entry.relative_path}" deleted`,
        color: 'success',
    })
}


async function resetFile(entry: Entry) {
    const resetModal = overlay.create(ConfirmFileModal, {
        destroyOnClose: true,
        props: {
            filePath: entry.relative_path,
            fileContent: entry.content,
            actionYes: 'reset',
        },
    })

    const shouldReset = await resetModal.open()

    if (!shouldReset) {
        toast.add({
            title: `Canceled: File "${entry.relative_path}" is not reset`,
            color: 'info',
        })
        return;
    }

    volumeStore.resetEntry(entry);

    toast.add({
        title: `Success: File "${entry.relative_path}" reset`,
        color: 'success',
    })

    save().then(() => {
        volumeStore.doPull();
    });
}

async function save() {
    const toastData: Omit<Partial<Toast>, "id"> = {
        title: 'Saving...',
        description: 'Please wait while we save your changes.',
        duration: 0,
        icon: 'lucide:loader-circle',
        close: false,
        color: 'neutral',
        ui: {
            icon: 'animate-spin',
        }
    };

    if (toast.toasts.value.find(t => t.id === 'file-editor.doSave')) {
        toast.update('file-editor.doSave', {
            ...toastData
        });
    } else {
        toast.add({
            id: 'file-editor.doSave',
            ...toastData
        });
    }

    return volumeStore
        .doPush()
        .then(() => {
            toast.update('file-editor.doSave', {
                title: 'Saved',
                description: 'Your changes have been saved.',
                icon: 'i-lucide-save',
                color: 'success',
                duration: undefined,
                close: true,
                ui: {
                    icon: undefined,
                }
            });
        })
        .catch((err) => {
            toast.update('file-editor.doSave', {
                title: 'Error',
                description: 'An error occurred while saving your changes.',
                icon: 'i-lucide-save',
                color: 'error',
                duration: undefined,
                close: true,
                ui: {
                    icon: undefined,
                }
            });

            // TODO: log error
        })
        .finally(() => {
            // TODO: broadcast event with channel
        });
}

export function useFileAction() {
    return {
        deleteFile,
        resetFile,
        save,
    }
}