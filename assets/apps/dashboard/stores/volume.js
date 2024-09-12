import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useApi } from '@/dashboard/library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '@/dashboard/library/notifier.js';
import { cloneDeep, isEqual } from 'lodash-es';

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

    function addNewEntry(fileName) {
        data.entries.push({
            name: fileName,
            content: `/* file: custom/${fileName} */\n\n`,
            relative_path: `custom/${fileName}`,
            handler: 'internal',
        });

        activeViewEntryRelativePath.value = `custom/${fileName}`;
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
                updateInitValues();

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
        doPull,
        doPush,
        hasChanged,
    };
});