const ctx = self as unknown as SharedWorkerGlobalScope;

const channel = new BroadcastChannel("windpress");

let buildQueue: Promise<void> = Promise.resolve();

ctx.addEventListener("connect", (event: MessageEvent) => {
    const port = event.ports[0];

    port.onmessage = (event: MessageEvent) => {
        const { task } = event.data;

        buildQueue = buildQueue.then(() => new Promise<void>((resolve) => {
            console.log("Running task:", task);
            setTimeout(() => {
                port.postMessage(`Task completed: ${task}`);
                resolve();
            }, 2000); // Simulate async task
        }));
    };
});
