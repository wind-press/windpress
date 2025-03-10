import { type Entry, useVolumeStore } from '@/dashboard/stores/volume'
import { nanoid } from 'nanoid'
import lzString from 'lz-string';
import dayjs from 'dayjs'
import ConfirmFileModal from '@/dashboard/components/File/Explorer/ContentMenu/ConfirmFileModal.vue'
import ConfirmVolumeImportModal from '@/dashboard/components/File/Explorer/ConfirmVolumeImportModal.vue';

const volumeStore = useVolumeStore()
const toast = useToast()
const overlay = useOverlay()

export type VolumeSFSFile = {
    entries: Entry[];
    _windpress: boolean;
    _version: string;
    _wp_version: string;
    _timestamp: number;
    _uid: string;
    _type: string;
}

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

function exportVolume() {
    const data = {
        entries: volumeStore.data.entries,
        _windpress: true,
        _version: window.windpress._version,
        _wp_version: window.windpress._wp_version,
        _timestamp: new Date().getTime(),
        _uid: nanoid(),
        _type: 'sfs',
    } as VolumeSFSFile;

    const compressed = lzString.compressToUint8Array(JSON.stringify(data));

    const blob = new Blob([compressed], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sfs-${dayjs().format('YYYYMMDDHHmmss')}.windpress`;
    a.click();
    URL.revokeObjectURL(url);

    toast.add({
        title: 'Exported',
        description: 'SFS volume data exported',
        color: 'success',
        icon: 'i-lucide-download'
    });
}

async function importVolume(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || !target.files || target.files.length === 0) {
        return;
    }

    const file = target.files[0];

    if (!file) {
        return;
    }

    if (!file.name.endsWith('.windpress')) {
        toast.add({
            title: 'SFS Import',
            description: 'Invalid file format',
            color: 'error',
            icon: 'i-lucide-upload'
        });

        return;
    }

    let data: VolumeSFSFile;

    try {
        data = JSON.parse(lzString.decompressFromUint8Array(new Uint8Array(await file.arrayBuffer())) || '{}');

        if (!data._windpress || data._type !== 'sfs') {
            throw new Error('File is not a valid WindPress file');
        }
    } catch (error) {
        toast.add({
            title: 'SFS Import',
            description: (error instanceof Error) ? error.message : 'An unknown error occurred',
            color: 'error',
            icon: 'i-lucide-upload'
        });

        return;
    }


    const importConfirmModal = overlay.create(ConfirmVolumeImportModal, {
        destroyOnClose: true,
        props: {
            data,
        },
    })

    const shouldImport = await importConfirmModal.open()

    if (!shouldImport) {
        toast.add({
            title: 'Canceled',
            description: 'SFS import canceled',
            color: 'info',
            icon: 'i-lucide-upload'
        });

        target.value = '';
        return;
    }

    toast.add({
        id: 'file-import.doImport',
        title: 'Importing...',
        description: 'Please wait while we import the data.',
        icon: 'lucide:loader-circle',
        close: false,
        duration: 0,
        color: 'neutral',
        ui: {
            icon: 'animate-spin',
        }
    });

    // delay the execution to show the loading toast
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        // Volume handler require to check the signature of existing files,
        // so remove the `signature` property where the `handler` property is "internal"
        const entries = data.entries.map((entry: Entry) => {
            if (entry.signature && entry.handler === 'internal') {
                const { signature: _signature, ...rest } = entry;
                return rest;
            }

            return entry;
        });

        volumeStore.data.entries = entries;

        // logStore.add({
        //     type: 'success',
        //     message: 'SFS data imported',
        // });

        toast.update('file-import.doImport', {
            title: 'Success',
            description: 'SFS data imported. Remember to save the changes.',
            color: 'success',
            icon: 'i-lucide-upload',
            duration: undefined,
            close: true,
            ui: {
                icon: undefined,
            }
        });

        target.value = '';
    } catch (error) {
        toast.update('file-import.doImport', {
            title: 'Error',
            description: (error instanceof Error) ? error.message : 'An unknown error occurred',
            color: 'error',
            icon: 'i-lucide-upload',
            close: true,
            duration: undefined,
        });

        target.value = '';
    }
}

export function useFileAction() {
    return {
        deleteFile,
        resetFile,
        save,
        exportVolume,
        importVolume,
    }
}