import { buildCache, type BuildCacheOptions } from './compiler';

const ctx = self as unknown as SharedWorkerGlobalScope;
const channel = new BroadcastChannel("windpress");


console.log("Worker started");

ctx.addEventListener("connect", (event) => {
    const port = event.ports[0];

    let buildQueue: Promise<void> = Promise.resolve();

    port.onmessage = function (e) {
        port.postMessage(`rooooo`);

        const { task } = e.data;

        port.postMessage(`Task running: ${task}`);
        buildQueue = buildQueue.then(async () => {
            buildCache();
            port.postMessage(`Task completed: ${task}`);


            channel.postMessage({
                source: 'windpress/compiler',
                target: 'windpress/dashboard',
                task: `log.${task}`,
                message: 'WORKER..',
                type: 'info',
            });
        });




    };
});