import { defineStore } from 'pinia';
import { computed, ref, watch, toRaw } from 'vue';
import { useApi } from '../library/api.js';
import { useBusyStore } from './busy.js';
import { useNotifier } from '../library/notifier.js';
import { isEqual } from 'lodash-es';

export const useTailwindStore = defineStore('tailwind', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    /**
     * The custom Tailwind CSS and config added with the filter hooks.
     * @param {object} _custom
     */
    const _custom = ref({
        css: {
            prepend: '',
            append: ''
        },
        config: {
            prepend: '',
            append: ''
        }
    });

    /**
     * The Tailwind main CSS file.
     * @param {string} css
     */
    const css = ref(null);
    const _cssInit = ref(null);
    const _cssDefault = ref(null);

    /**
     * The Tailwind preset that will be used to generate the Tailwind config.
     * @param {string} preset
     */
    const preset = ref(null);
    const _presetInit = ref(null);
    const _presetDefault = ref(null);

    /**
     * The Tailwind config that gets generated from the preset.
     * @param {string} config
     */
    const config = ref(null);
    const _configInit = ref(null);
    const _configDefault = ref(null);

    /**
     * The Tailwind wizard.
     * @param {object[]} wizard
     */
    const wizard = ref([]);
    const _wizardInit = ref([]);
    const _wizardDefault = ref([]);

    const selectedWizardId = ref(null);

    const selectedWizard = computed(() => {
        return wizard.value.find(w => w.id === selectedWizardId.value);
    });

    watch(wizard, (value) => {
        if (selectedWizardId.value !== null && !value.find((item) => item.id === selectedWizardId.value)) {
            selectedWizardId.value = null;
        }
    }, { deep: true });

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
            .then((data) => {
                css.value = data.tailwind.css;
                preset.value = data.tailwind.preset;
                config.value = data.tailwind.config;
                wizard.value = data.tailwind.wizard;
                selectedWizardId.value = data.tailwind.wizard[0].id;

                _cssDefault.value = data._default.css;
                _presetDefault.value = data._default.preset;
                _configDefault.value = data._default.config;
                _wizardDefault.value = data._default.wizard;

                _custom.value = data._custom;

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
                        css: css.value,
                        preset: preset.value,
                        config: config.value,
                        wizard: wizard.value,
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
        _cssInit.value = css.value;
        _presetInit.value = preset.value;
        _configInit.value = config.value;
        _wizardInit.value = toRaw(wizard.value);
    }

    /**
     * Check if the data has changed.
     */
    function hasChanged() {
        if (isEqual(_cssInit.value, css.value) === false) return true;
        if (isEqual(_presetInit.value, preset.value) === false) return true;
        if (isEqual(_configInit.value, config.value) === false) return true;
        if (isEqual(toRaw(_wizardInit.value), toRaw(wizard.value)) === false) return true;
        return false;
    }

    return {
        initValues: {
            css: _cssInit,
            preset: _presetInit,
            config: _configInit,
            wizard: _wizardInit,
        },
        defaultValues: {
            css: _cssDefault,
            preset: _presetDefault,
            config: _configDefault,
            wizard: _wizardDefault,
        },
        customValue: _custom,
        css,
        preset,
        config,
        wizard,
        selectedWizardId,
        selectedWizard,
        doPull,
        doPush,
        hasChanged,
    };
});