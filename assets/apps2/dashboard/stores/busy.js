import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLogStore } from './log';

export const useBusyStore = defineStore('busy', () => {
    const log = useLogStore();

    const tasks = ref([]);

    const isBusy = computed(() => tasks.value.length > 0);

    const hasTask = computed(() => {
        return (task) => tasks.value.some((t) => t.task === task);
    });

    /**
     * @param {string} task 
     * @param {string|object} message
     * @param {string} message.message The message to log.
     * @param {string} message.type `success`, `info`, `warning`, `error`
     * @param {object} message.group The namespace or group name of the log.
     */
    function add(task = null, message = null) {
        tasks.value.unshift({
            timestamp: Date.now(),
            task: task,
        });

        if (message) {
            if (typeof message === 'string') {
                log.add({
                    message,
                    type: 'info',
                    group: 'busy',
                });
            } else if (typeof message === 'object') {
                log.add({
                    type: 'info',
                    group: 'busy',
                    ...message,
                });
            }
        }
    }

    /**
     * @param {string} task 
     */
    function remove(task = null) {
        let found = false;
        tasks.value = tasks.value.filter((t) => {
            if (found) {
                return true;
            }
            if (t.task === task) {
                found = true;
                return false;
            }
            return true;
        });
    }

    function reset() {
        tasks.value = [];
    }

    return {
        tasks,
        isBusy,
        hasTask,
        add,
        remove,
        reset,
    };
});