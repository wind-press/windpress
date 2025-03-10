import { defineStore } from 'pinia';
import { shallowRef, ref, computed, reactive } from 'vue';
import { useApi } from '@/dashboard/library/api';
// import { useNotifier } from '@/dashboard/library/notifier.js';
import { cloneDeep, isEqual } from 'lodash-es';
import { __ } from '@wordpress/i18n';
import { useBusyStore } from './busy';

export type Entry = {
    // The name of the file.
    name: string;

    // The content of the file.
    content: string;

    // The relative path of the file on the volume.
    relative_path: string;

    // The handler of the file. Default is `internal`.
    handler: string;

    // Soft delete the file. Default is `false`. If `true`, the file will be hidden and deleted from the volume on push.
    hidden?: boolean;

    // Readonly file
    readonly?: boolean;

    // Signature to check the authenticity of the file
    signature?: string;
};

export const useVolumeStore = defineStore('volume', () => {
    const api = useApi();
    const busyStore = useBusyStore();
    // const notifier = useNotifier();

    /**
     * The volume data which will be mounted.
     */
    const data = reactive({
        entries: [] as Entry[],
    });

    /**
     * The initial volume data which will be used to check if the data has changed.
     */
    const initData = reactive({
        entries: [] as Entry[],
    });

    const activeViewEntryRelativePath = ref<string | null>(null);

    /**
     * Clean the file path before adding it to the volume of the Simple File System.
     */
    function cleanPath(path: string): string {
        // Only allow a-z, A-Z, 0-9, ., -, _, /
        path = path.replace(/[^a-zA-Z0-9._/-]+/g, '');

        // Replace multiple consecutive dots with a single dot
        path = path.replace(/\.{2,}/g, '.');

        // Replace multiple consecutive slashes with a single slash
        path = path.replace(/\/{2,}/g, '/');

        // Remove leading and trailing dots, hyphens, underscores, and slashes
        path = path.replace(/^[._/ -]+|[._/ -]+$/g, '');

        return path;
    }

    function addNewEntry(filePath: string) {
        // Split the file path and directory path and remove any unwanted characters
        let filePathParts = filePath.split('/').map(cleanPath).join('/');
        filePathParts = cleanPath(filePathParts);

        // Check if the file path exists
        const existingEntryIndex = data.entries.findIndex(entry => entry.relative_path === filePathParts);

        if (existingEntryIndex !== -1) {
            // If not hidden, throw
            if (data.entries[existingEntryIndex].hidden === false) {
                throw new Error(__(`A file named "${filePathParts}" already exists`, 'windpress'));
            }

            // If hidden, unhide it, and set the content
            data.entries[existingEntryIndex].hidden = false;
            data.entries[existingEntryIndex].content = `/* file: ${filePathParts} */\n\n`;
        } else {
            data.entries.push({
                name: filePathParts.split('/').pop() || '',
                content: `/* file: ${filePathParts} */\n\n`,
                relative_path: `${filePathParts}`,
                handler: 'internal',
            });
        }

        activeViewEntryRelativePath.value = `${filePathParts}`;
    }

    function softDeleteEntry(entry: Entry) {
        const entryIndex = data.entries.findIndex(e => e.relative_path === entry.relative_path);
        data.entries[entryIndex].content = '';
        data.entries[entryIndex].hidden = true;

        // if the active view entry is the one being deleted, set it to null
        if (activeViewEntryRelativePath.value === entry.relative_path) {
            activeViewEntryRelativePath.value = null;
        }
    }

    function resetEntry(entry: Entry) {
        const entryIndex = data.entries.findIndex(e => e.relative_path === entry.relative_path);
        data.entries[entryIndex].content = '';
    }

    function getKVEntries() {
        // Create a volume object with key-value pairs (relative_path: content) from the volumeStore.data.entries array
        return data.entries.reduce((acc: { [key: string]: string }, entry) => {
            acc[`/${entry.relative_path}`] = entry.content;
            return acc;
        }, {});
    }

    /**
     * Pull the data from the server.
     *
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('volume.doPull');

        return await api
            .request('/admin/volume/index', { method: 'GET' })
            .then(response => response.data)
            .then(res => {
                const entries = res.entries;

                data.entries = entries;
                updateInitValues();
            })
            .catch(error => {
                // notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('volume.doPull');
            });
    }

    /**
     * Push the data to the server.
     *
     * @returns {Promise} A promise
     */
    async function doPush() {
        busyStore.add('volume.doPush');

        return api
            .request('/admin/volume/store', {
                method: 'POST',
                data: { volume: { entries: data.entries } },
            })
            .then(response => {
                updateInitValues();
                return { message: response.data.message, success: true };
            })
            .catch(error => {
                throw new Error(error.response ? error.response.data.message : error.message);
            })
            .finally(() => {
                busyStore.remove('volume.doPush');
            });
    }

    /**
     * Store the initial values.
     */
    function updateInitValues() {
        if (data.entries.length === 0) {
            return;
        }

        if (activeViewEntryRelativePath.value === null) {
            activeViewEntryRelativePath.value = 'main.css';
        }

        // Avoid unnecessary cloning if nothing has changed
        if (!hasChanged.value) return;

        initData.entries = cloneDeep(data.entries);
    }

    /**
     * Check if the data has changed.
     */
    const hasChanged = computed(() => !isEqual(data.entries, initData.entries));

    /**
     * Check if a specific entry has changed.
     */
    function entryHasChanged(key: string): boolean {
        const entry = data.entries.find(e => e.relative_path === key);
        const initEntry = initData.entries.find(e => e.relative_path === key);
        return !isEqual(entry, initEntry);
    }

    return {
        data,
        activeViewEntryRelativePath,
        hasChanged,
        addNewEntry,
        getKVEntries,
        doPull,
        doPush,
        entryHasChanged,
        softDeleteEntry,
        resetEntry,
        cleanPath,
    };
});
