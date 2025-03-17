import { defineStore } from 'pinia';
import { useApi } from '../library/api.js';
import { useBusyStore } from './busy.js';
// import { useNotifier } from '../library/notifier.js';
import { cloneDeep } from 'lodash-es';
import { createVirtualRef } from '@/dashboard/composables/virtualRef';

export const useSettingsStore = defineStore('settings', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    // const notifier = useNotifier();

    const { state: options, getVirtualRef: virtualOptions } = createVirtualRef({});

    /**
     * Pull the data from the server.
     *
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('settings.doPull');

        return await api
            .request('/admin/settings/options/index', { method: 'GET', })
            .then((response) => {
                options.value = cloneDeep(response.data.options);
                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
                // notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('settings.doPull');
            });
    }

    /**
     * Push the data to the server.
     *
     * @returns {Promise} A promise
     */
    async function doPush() {
        busyStore.add('settings.doPush');

        return api
            .request('/admin/settings/options/store', {
                method: 'POST',
                data: {
                    options: options.value,
                },
            })
            .then((response) => {
                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
                throw new Error(error.response ? error.response.data.message : error.message);
            })
            .finally(() => {
                busyStore.remove('settings.doPush');
            });
    }

    /**
     * Pull the data from the server when the store is initialized.
     */
    function initPull() {
        if (Object.keys(options.value as object).length === 0) {
            doPull();
        }
    }

    return {
        options,
        virtualOptions,
        doPull,
        doPush,
        initPull,
    };
});