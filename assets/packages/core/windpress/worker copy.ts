// const ctx = self as unknown as SharedWorkerGlobalScope;
// import { buildCache, type BuildCacheOptions } from './compiler';

// const channel = new BroadcastChannel("windpress");

// let buildQueue: Promise<void> = Promise.resolve();

// console.log("Worker started");

// ctx.addEventListener("connect", (event: MessageEvent) => {
//     const port = event.ports[0];

//     console.log("Connected to port:", port);
//     port.postMessage("Connected to worker port");

//     port.onmessage = (event: MessageEvent) => {
//         const { task } = event.data;

//         console.log("Received task:", event);

//         buildQueue = buildQueue.then(async () => {
//             port.postMessage(`Task running: ${task}`);
//             await buildCache();
//             port.postMessage(`Task completed: ${task}`);
//         });

//         // buildQueue = buildQueue.then(() => new Promise<void>((resolve) => {
//         //     console.log("Running task:", task);

//         //     setTimeout(() => {
//         //         port.postMessage(`Task completed: ${task}`);
//         //         resolve();
//         //     }, 2000); // Simulate async task
//         // }));
//     };

// });


















// onconnect = function (event) {
//     const port = event.ports[0];

//     port.onmessage = function (e) {
//         const workerResult = `Result: ${e.data[0] * e.data[1]}`;
//         port.postMessage(workerResult);
//     };
// };