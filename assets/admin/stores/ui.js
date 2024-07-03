import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { get, set } from 'lodash-es';

export const useUIStore = defineStore('ui', () => {
    const state = ref({});
    
    // Persistent state in local storage.
    // for non-persistent usage, use `const _virtualState = {}` instead
    const _virtualState = useStorage('windpress.ui.state', state);

    // Provide a virtual path access even if it doesn't exist.
    // Example:
    //  Get: virtualState('path.to.value', 'default value').value;
    //  Set: virtualState('path.to.value').value = 'new value';
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
