import { buildCache, type BuildCacheOptions } from './compiler';
import { useLogStore } from '@/dashboard/stores/log';

export async function setupWorker(channel: BroadcastChannel) {
    let buildQueue: Promise<void> = Promise.resolve();
    const logStore = useLogStore();

    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/compiler';
        const target = 'windpress/dashboard';

        // if has task and task is prefixed with `log.`. tasks: log.add, log.update
        if (data.source === source && data.target === target && data.task?.startsWith('log.')) {
            const task = data.task.replace('log.', '');
            if (task === 'add') {
                logStore.add(data.data.log);
            } else if (task === 'update') {
                logStore.update(data.data.log.id, data.data.log);
            }
        }
    });

    if ('locks' in navigator) {
        navigator.locks.request("task_lock", { mode: "exclusive" }, lock => {
            console.log("This tab is the leader.");

            channel.addEventListener('message', async (e) => {
                const data = e.data;
                const source = 'windpress/dashboard';
                const target = 'windpress/compiler';

                if (data.source === source && data.target === target && data.task === 'generate-cache') {
                    buildQueue = buildQueue.then(async () => {
                        await buildCache(data.data as BuildCacheOptions).then(() => {
                            channel.postMessage({
                                source: 'windpress/compiler',
                                target: 'windpress/dashboard',
                                task: 'generate-cache.response',
                                data: {
                                    status: 'success',
                                }
                            });
                        }).catch((e) => {
                            channel.postMessage({
                                source: 'windpress/compiler',
                                target: 'windpress/dashboard',
                                task: 'generate-cache.response',
                                data: {
                                    status: 'error',
                                }
                            });

                            console.error(e);
                        });

                    }).catch((e) => {
                        console.error(e);
                    });
                }
            });

            // Keep the lock until the tab is closed
            return new Promise(() => { });
        }).catch(() => {
            console.log("Another tab is the leader.");
        });
    } else {
        console.log("Locks API not supported in this browser.");
    }
}