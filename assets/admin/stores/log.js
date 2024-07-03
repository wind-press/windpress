import { defineStore } from 'pinia';
import { ref } from 'vue';
import { nanoid } from 'nanoid';

export const useLogStore = defineStore('log', () => {
    const logs = ref([]);

    /**
     * @param {object} log
     * @param {string} log.message The message to log.
     * @param {string} log.type `success`, `info`, `warning`, `error`
     * @param {object} log.options Additional options.
     * @param {string} log.group The namespace or group name of the log.
     * @returns {string} The ID of the log.
     */
    function add(log) {
        let id = nanoid(10);
        logs.value.push({
            id,
            timestamp: Date.now(),
            ...log,
        });

        return id;
    }

    /**
     * @param {string} toSearch The value to search for.
     * @param {string} by The key to search by. Default is `id`. Available keys are `id`, `message`, `type`, and `group`.
     */
    function remove(toSearch, by = 'id') {
        switch (by) {
            case 'message':
                logs.value = logs.value.filter((log) => !log.message.includes(toSearch));
                break;
            case 'type':
                logs.value = logs.value.filter((log) => log.type !== toSearch);
                break;
            case 'group':
                logs.value = logs.value.filter((log) => log.group !== toSearch);
                break;
            case 'id':
            default:
                logs.value = logs.value.filter((log) => log.id !== toSearch);
                break;
        }
    }

    function clear() {
        logs.value = [];
    }

    return {
        logs,
        add,
        remove,
        clear,
    };
});