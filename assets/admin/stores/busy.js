import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useBusyStore = defineStore('busy', () => {
    const tasks = ref([]);

    const isBusy = computed(() => tasks.value.length > 0);

    const hasTask = computed(() => {
        return (task) => tasks.value.some((t) => t.task === task);
    });

    /**
     * @param {string} task 
     */
    function add(task = null) {
        tasks.value.unshift({
            timestamp: Date.now(),
            task: task,
        });
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