import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useApi } from '@/dashboard/library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '@/dashboard/library/notifier.js';
import { cloneDeep, isEqual } from 'lodash-es';
import { __ } from '@wordpress/i18n';

export const useVolumeStore = defineStore('volume', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    /**
     * The volume data which will mounted.
     */
    const data = reactive({
        entries: [],
    });

    const initData = reactive({
        entries: [],
    });

    const activeViewEntryRelativePath = ref(null);

    function cleanPath(path) {
        // remove ? [ ] \ = < > : ; , ' " & $ # * ( ) | ~ ` ! { } % + ’ « » ” “ \0
        path = path.replace(/[?[\]\\=<>:;,'"&$#*()|~`!{}%+’«»”“\0]+/g, '');
        // %20, + into -
        path = path.replace(/%20|\+/g, '-');
        // multi . into .
        path = path.replace(/\.{2,}/g, '.');
        // multi / into /
        path = path.replace(/\/{2,}/g, '/');
        // \r, \n, \t, space, - into -
        path = path.replace(/[\r\n\t -]+/g, '-');
        // remove leading and trailing ., -, _, /, and space
        path = path.replace(/^[._/ -]+|[._/ -]+$/g, '');

        return path;
    }

    function addNewEntry(filePath) {
        // split the file path and directory path and remove any unwanted characters
        let filePathParts = filePath.split('/').map((pathPart) => cleanPath(pathPart)).join('/');
        filePathParts = cleanPath(filePathParts);

        // check if the file path is existing
        const existingEntryIndex = data.entries.findIndex((entry) => entry.relative_path === filePathParts);

        if (existingEntryIndex !== -1) {
            // if not hidden, throw
            if (data.entries[existingEntryIndex].hidden === false) {
                throw new Error(__(`A file named "${filePathParts}" already exists`, 'windpress'));
            }

            // if hidden, unhide it, and set the content
            data.entries[existingEntryIndex].hidden = false;
            data.entries[existingEntryIndex].content = `/* file: ${filePathParts} */\n\n`;
        } else {
            data.entries.push({
                name: filePathParts.split('/').pop(),
                content: `/* file: ${filePathParts} */\n\n`,
                relative_path: `${filePathParts}`,
                handler: 'internal',
            });
        }

        activeViewEntryRelativePath.value = `${filePathParts}`;
    }

    function softDeleteEntry(entry) {
        const entryIndex = data.entries.findIndex((e) => e.relative_path === entry.relative_path);
        data.entries[entryIndex].content = null;
        data.entries[entryIndex].hidden = true;
    }

    function getKVEntries() {
        // create a volume object with key-value pairs (relative_path: content) from the volumeStore.data.entries array
        return data.entries.reduce((acc, entry) => {
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
            .request({
                method: 'GET',
                url: '/admin/volume/index',
            })
            .then(response => response.data)
            .then((res) => {
                const entries = res.entries;

                const tailwindConfigJsIndex = entries.findIndex((entry) => entry.relative_path === 'tailwind.config.js');
                if (tailwindConfigJsIndex !== -1) {
                    const tailwindConfigJs = entries.splice(tailwindConfigJsIndex, 1);
                    entries.unshift(...tailwindConfigJs);
                }

                const mainCssIndex = entries.findIndex((entry) => entry.relative_path === 'main.css');
                if (mainCssIndex !== -1) {
                    const mainCss = entries.splice(mainCssIndex, 1);
                    entries.unshift(...mainCss);
                }

                data.entries = entries;

                updateInitValues();
            })
            .catch((error) => {
                notifier.alert(error.message);
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
            .request({
                method: 'POST',
                url: '/admin/volume/store',
                data: {
                    volume: {
                        entries: data.entries,
                    }
                },
            })
            .then((response) => {
                // updateInitValues();

                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
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

        initData.entries = cloneDeep(data.entries);
    }

    /**
     * Check if the data has changed.
     */
    function hasChanged() {
        if (isEqual(data[key].init, data[key].current) === false) return true;
        return false;
    }

    return {
        data,
        activeViewEntryRelativePath,
        addNewEntry,
        getKVEntries,
        doPull,
        doPush,
        hasChanged,
        softDeleteEntry,
    };
});