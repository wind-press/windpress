import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useApi } from '@/dashboard/library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '@/dashboard/library/notifier.js';
import { isEqual } from 'lodash-es';

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
                data.entries = res.entries;
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
        return;
        busyStore.add('volume.doPush');

        return api
            .request({
                method: 'POST',
                url: '/admin/volume/store',
                data: {
                    volume: {
                        entries: data.entries.current,
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
        doPull,
        doPush,
        hasChanged,
    };
});