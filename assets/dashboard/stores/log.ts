import { defineStore } from 'pinia';
import { ref } from 'vue';
import { nanoid } from 'nanoid';

export type Log = {
    /** The message to log. */
    message: string;

    /** The type of the log entry. */
    type: 'success' | 'info' | 'warning' | 'error' | 'debug';

    /** The namespace or group name of the log. */
    group?: string;

    /** The unique identifier of the log (if available). */
    id?: string;

    /** The timestamp of the log (Unix time in milliseconds). */
    timestamp?: number;

    /** Additional options related to the log entry. */
    options?: object;
}

export const useLogStore = defineStore('log', () => {
    const logs = ref<Log[]>([]);

    function add(log: Log): string {
        const id: string = nanoid(10);
        logs.value.push({
            id,
            timestamp: Date.now(),
            ...log,
        });

        return id;
    }

    function update(id: string, log: Log) {
        const curr = logs.value.find((l) => l.id === id);

        if (curr) {
            Object.assign(curr, log);
        }
    }

    /**
     * @param {string} toSearch The value to search for.
     * @param {string} by The key to search by. Default is `id`. Available keys are `id`, `message`, `type`, and `group`.
     */
    function remove(toSearch: string, by: 'id' | 'message' | 'type' | 'group' = 'id'): void {
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
        update,
        remove,
        clear,
    };
});