import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import { useApi } from '@/dashboard/library/api';
import { cloneDeep, isEqual } from 'lodash-es';
import { __ } from '@wordpress/i18n';
import { useBusyStore } from './busy';
import { useStorage } from '@vueuse/core';

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

    path_on_disk?: string; // The path on disk, used for the file manager

    // Version token for conflict detection (checksum)
    version_token?: string;
};

// TODO: Future - Conflict type is currently unused as conflict detection is disabled
// Re-enable when implementing proper conflict resolution in Volume.php
export type Conflict = {
    path: string;
    your_content: string;
    disk_content: string;
    disk_checksum: string;
};

export const useVolumeStore = defineStore('volume', () => {
    const api = useApi();
    const busyStore = useBusyStore();

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
    const _activeViewEntryRelativePath = useStorage<string | null>('windpress.dashboard.store.volume.activeViewEntryRelativePath', null);

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

    function addNewEntry(filePath: string, handler: undefined|string = 'internal') {
        // Split the file path and directory path and remove any unwanted characters
        let filePathParts: string|string[] = filePath.split('/');

        if (handler === undefined || handler === 'internal') {
            filePathParts = filePathParts.map(part => cleanPath(part)).join('/');
            filePathParts = cleanPath(filePathParts);
        } else {
            filePathParts = filePathParts.join('/');
        }

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
            data.entries[existingEntryIndex].handler = handler;
        } else {
            data.entries.push({
                name: filePathParts.split('/').pop() || '',
                content: `/* file: ${filePathParts} */\n\n`,
                relative_path: `${filePathParts}`,
                handler: handler || 'internal',
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

    function renameEntry(entry: Entry, filePath: string) {
        const entryIndex = data.entries.findIndex(e => e.relative_path === entry.relative_path);

        let filePathParts = filePath.split('/').map(cleanPath).join('/');
        filePathParts = cleanPath(filePathParts);

        // check if the file path exists
        const existingEntryIndex = data.entries.findIndex(e => e.relative_path === filePathParts);

        if (existingEntryIndex !== -1) {
            // If not hidden, throw
            if (data.entries[existingEntryIndex].hidden === false) {
                throw new Error(__(`A file named "${filePathParts}" already exists`, 'windpress'));
            }
            // If hidden, unhide it, and set the content
            data.entries[existingEntryIndex].hidden = false;
            data.entries[existingEntryIndex].content = data.entries[entryIndex].content;

            // delete signature if it exists
            if (data.entries[existingEntryIndex].signature) {
                delete data.entries[existingEntryIndex].signature;
            }

        } else {
            // clone the entry
            const newEntry = cloneDeep(data.entries[entryIndex]);
            newEntry.relative_path = filePathParts;
            newEntry.name = filePathParts.split('/').pop() || '';
            newEntry.content = data.entries[entryIndex].content;
            newEntry.hidden = false;
            newEntry.signature = undefined;
            data.entries.push(newEntry);
        }

        // soft delete the old entry
        softDeleteEntry(entry);
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
     * @returns {Promise} A promise with result or conflict information
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
                // Redaxios doesn't have error.response, the error IS the response
                const status = error.status
                const data = error.data

                // TODO: Future - This conflict handling code path won't execute until conflict detection is re-enabled
                // Check if it's a conflict error (HTTP 409)
                if (status === 409) {
                    const conflicts: Conflict[] = data.conflicts || [];

                    return {
                        success: false,
                        conflicts,
                        message: __('Conflicts detected. Files were modified externally.', 'windpress'),
                    };
                }

                // Other errors
                throw new Error(data?.message || error.message || 'Unknown error');
            })
            .finally(() => {
                busyStore.remove('volume.doPush');
            });
    }

    watch(activeViewEntryRelativePath, (val) => {
        _activeViewEntryRelativePath.value = val;
    });

    /**
     * Store the initial values.
     */
    function updateInitValues() {
        if (data.entries.length === 0) {
            return;
        }

        const pathExists = data.entries.some(entry => entry.relative_path === _activeViewEntryRelativePath.value);

        activeViewEntryRelativePath.value = pathExists ? _activeViewEntryRelativePath.value : 'main.css';

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

    /**
     * Pull the data from the server when the store is initialized.
     */
    async function initPull(): Promise<void> {
        if (data.entries.length === 0) {
            return doPull();
        }
        return Promise.resolve();
    }

    /**
     * Get version history for a file.
     */
    async function getVersions(relativePath: string) {
        busyStore.add('volume.getVersions');

        return api
            .request(`/admin/volume/versions/${encodeURIComponent(relativePath)}`, {
                method: 'GET',
            })
            .then(response => response.data)
            .finally(() => {
                busyStore.remove('volume.getVersions');
            });
    }

    /**
     * Get content of a specific version.
     */
    async function getVersionContent(relativePath: string, version: number) {
        busyStore.add('volume.getVersionContent');

        return api
            .request(`/admin/volume/versions/${encodeURIComponent(relativePath)}/${version}`, {
                method: 'GET',
            })
            .then(response => response.data)
            .finally(() => {
                busyStore.remove('volume.getVersionContent');
            });
    }

    /**
     * Restore a specific version.
     */
    async function restoreVersion(relativePath: string, version: number) {
        busyStore.add('volume.restoreVersion');

        return api
            .request('/admin/volume/versions/restore', {
                method: 'POST',
                data: { path: relativePath, version },
            })
            .then(response => {
                // Update the entry in the store with restored content
                const entry = data.entries.find(e => e.relative_path === relativePath);
                if (entry && response.data.entry) {
                    entry.content = response.data.entry.content;
                    entry.version_token = response.data.entry.version_token;
                }

                updateInitValues();
                return response.data;
            })
            .finally(() => {
                busyStore.remove('volume.restoreVersion');
            });
    }

    return {
        data,
        initData,
        activeViewEntryRelativePath,
        hasChanged,
        addNewEntry,
        getKVEntries,
        doPull,
        doPush,
        entryHasChanged,
        softDeleteEntry,
        resetEntry,
        renameEntry,
        cleanPath,
        initPull,
        getVersions,
        getVersionContent,
        restoreVersion,
    };
});
