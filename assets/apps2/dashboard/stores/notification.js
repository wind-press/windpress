import { defineStore } from 'pinia';
import { ref } from 'vue';
import { nanoid } from 'nanoid';

export const useNotificationStore = defineStore('notification', () => {
    const notices = ref([]);

    /**
     * @param {object} notice
     * @param {string} notice.message
     * @param {string} notice.type - 'success', 'info', 'warning', 'error'
     * @param {object} notice.options
     */
    function add(notice) {
        let id = nanoid(10);
        notices.value.unshift({
            id,
            timestamp: Date.now(),
            ...notice,
        });

        return id;
    }

    function remove(id) {
        notices.value = notices.value.filter((notice) => notice.id !== id);
    }

    return {
        notices,
        add,
        remove,
    };
});