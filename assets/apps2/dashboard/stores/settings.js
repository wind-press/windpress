import { defineStore } from 'pinia';
import { useApi } from '../library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '../library/notifier.js';
import { cloneDeep } from 'lodash-es';
import { createVirtualRef } from '@/dashboard/composables/virtual.js';

export const useSettingsStore = defineStore('settings', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    const { state: options, getVirtualRef: virtualOptions } = createVirtualRef({});

    /**
     * Pull the data from the server.
     *
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('settings.doPull');

        return await api
            .request({
                method: 'GET',
                url: '/admin/settings/options/index',
            })
            .then((response) => {
                options.value = cloneDeep(response.data.options);
                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
                notifier.alert(error.message);
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
            .request({
                method: 'POST',
                url: '/admin/settings/options/store',
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

    return {
        options,
        virtualOptions,
        doPull,
        doPush,
    };
});