import { defineStore } from 'pinia';
import { computed, watch, reactive } from 'vue';
import { useApi } from '@/dashboard/library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '@/dashboard/library/notifier.js';
import { isEqual } from 'lodash-es';

export const useTailwindStore = defineStore('tailwind', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    /**
     * The custom Tailwind CSS and config added with the filter hooks.
     */
    const data = reactive({
        main_css: {
            current: null,
            init: null,
            default: null,
            prepend: '',
            append: '',
        },
        wizard: {
            current: [],
            init: [],
            default: [],
            selected_id: null,
            selected: computed(() => {
                return data.wizard.current.find(w => w.id === data.wizard.selected_id);
            }),
        },
    });

    // watch(data.wizard.current, (value) => {
    //     if (data.wizard.selected_id !== null && !value.find((item) => item.id === data.wizard.selected_id)) {
    //         data.wizard.selected_id = null;
    //     }
    // });

    watch(() => data.wizard.current, (value) => {
        if (data.wizard.selected_id !== null && !value.find((item) => item.id === data.wizard.selected_id)) {
            data.wizard.selected_id = null;
        }
    });

    /**
     * Pull the data from the server.
     *
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('tailwind.doPull');

        return await api
            .request({
                method: 'GET',
                url: '/admin/tailwind/index',
            })
            .then(response => response.data)
            .then((res) => {
                data.main_css.current = res.tailwind.main_css;
                data.main_css.default = res.tailwind._main_css;

                updateInitValues();
            })
            .catch((error) => {
                notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('tailwind.doPull');
            });
    }

    /**
     * Push the data to the server.
     *
     * @returns {Promise} A promise
     */
    async function doPush() {
        busyStore.add('tailwind.doPush');

        return api
            .request({
                method: 'POST',
                url: '/admin/tailwind/store',
                data: {
                    tailwind: {
                        main_css: data.main_css.current,
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
                busyStore.remove('tailwind.doPush');
            });
    }

    /**
     * Store the initial values.
     */
    function updateInitValues() {
        data.main_css.init = data.main_css.current;
    }

    /**
     * Check if the data has changed.
     */
    function hasChanged(key) {
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