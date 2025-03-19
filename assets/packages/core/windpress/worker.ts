import { buildCache, type BuildCacheOptions } from './compiler';

export async function setupWorker() {
    const channel = new BroadcastChannel('windpress');
    let buildQueue: Promise<void> = Promise.resolve();

    if ('locks' in navigator) {
        navigator.locks.request("task_lock", { mode: "exclusive" }, lock => {
            console.log("This worker is the leader.");

            channel.addEventListener('message', async (e) => {
                const data = e.data;
                const source = ['windpress/dashboard', 'windpress/integration'];
                const target = 'windpress/compiler';

                if (source.includes(data.source) && data.target === target && data.task === 'generate-cache') {
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
            console.log("Another worker is the leader.");
        });
    } else {
        console.log("Locks API not supported in this browser.");
    }
}