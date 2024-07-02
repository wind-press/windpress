import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { get, set } from 'lodash-es';

export const useUIStore = defineStore('ui', () => {
    const state = ref({});
    
    // Persistent state in local storage.
    // for non-persistent usage, use `const _virtualState = {}` instead
    const _virtualState = useStorage('ui', state);

    const virtualState = (path, defaultValue = null) => {
        if (!_virtualState[path]) {
            _virtualState[path] = computed({
                get() {
                    return get(state.value, path, defaultValue);
                },
                set(value) {
                    set(state.value, path, value);
                },
            });
        }
    
        return _virtualState[path];
    };

    return {
        state,
        virtualState,
    };
});