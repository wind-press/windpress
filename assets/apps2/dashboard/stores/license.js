import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useApi } from '@/dashboard/library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '@/dashboard/library/notifier.js';
import { cloneDeep, get } from 'lodash-es';

export const useLicenseStore = defineStore('license', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    const license = ref({
        key: ''
    });

    const isActivated = computed(() => {
        return get(license.value, 'is_activated', false);
    });

    /**
     * Pull the data from the server.
     *
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('settings.license.doPull');

        return await api
            .request({
                method: 'GET',
                url: '/admin/settings/license/index',
            })
            .then((response) => {
                license.value = cloneDeep(response.data.license);
            })
            .catch((error) => {
                notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('settings.license.doPull');
            });
    }

    async function doActivate(licenseKey) {
        busyStore.add('settings.license.activate');

        return api
            .request({
                method: 'POST',
                url: '/admin/settings/license/activate',
                data: {
                    license: licenseKey,
                },
            })
            .then((response) => {
                license.value = cloneDeep(response.data.license);
                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
                throw new Error(error.response ? error.response.data.message : error.message);
            })
            .finally(() => {
                busyStore.remove('settings.license.activate');
            });
    }

    async function doDeactivate() {
        busyStore.add('settings.license.deactivate');

        return api
            .request({
                method: 'POST',
                url: '/admin/settings/license/deactivate',
                data: {
                    license: license.value,
                },
            })
            .then((response) => {
                license.value = cloneDeep(response.data.license);
                return {
                    message: response.data.message,
                    success: true,
                };
            })
            .catch((error) => {
                throw new Error(error.response ? error.response.data.message : error.message);
            })
            .finally(() => {
                busyStore.remove('settings.license.deactivate');
            });
    }

    return {
        license,
        isActivated,
        doPull,
        doActivate,
        doDeactivate,
    };
});