import { defineStore } from 'pinia';
import { createVirtualRef } from '@/dashboard2/composables/virtual.js';

export const useUIStore = defineStore('ui', () => {
    const { state, getVirtualRef } = createVirtualRef({}, { 
        persist: 'windpress.ui.state'
    });

    return {
        state,
        virtualState: getVirtualRef,
    };
});