import { customRef, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { get, set } from 'lodash-es';

export function createVirtualRef(initialState, options) {
    const state = options?.persist
        ? useStorage(options.persist, initialState)
        : ref(initialState);

    const customRefs = {}
    function getVirtualRef(path, initialValue) {
        if (!customRefs[path]) {
            customRefs[path] = customRef((track, trigger) => {
                return {
                    get() {
                        track();
                        return get(state.value, path, initialValue);
                    },
                    set(value) {
                        set(state.value, path, value);
                        trigger();
                    }
                }
            });
        }
        return customRefs[path]
    }

    return {
        state,
        getVirtualRef
    }
}