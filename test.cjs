// const threads = require("worker_threads");
// const { Worker, isMainThread } = threads;


function a(b, c) {
    return { b, c }
}

class A {
    static a(b) {
        return a(...arguments)
    }
}

console.log(A.a(321321321321, 'fdsajs'))
    // const LOCKED = 1;
    // const UNLOCKED = 0;

// class BinarySemaphore {
//     constructor(shared, offset = 0) {
//         this.lock = new Int32Array(shared, offset, 1);
//     }

//     enter() {
//         while (true) {
//             if (
//                 Atomics.compareExchange(this.lock, 0, UNLOCKED, LOCKED) === UNLOCKED
//             ) {
//                 return;
//             }
//             Atomics.wait(this.lock, 0, LOCKED);
//         }
//     }

//     leave() {
//         if (Atomics.compareExchange(this.lock, 0, LOCKED, UNLOCKED) !== LOCKED) {
//             throw new Error("Cannot leave unlocked BinarySemaphore");
//         }
//         Atomics.notify(this.lock, 0, 1);
//     }

//     exec(callback) {
//         this.enter();
//         try {
//             return callback();
//         } finally {
//             this.leave();
//         }
//     }
// }

// if (isMainThread) {
//     const buffer = new SharedArrayBuffer(6);

//     for (let i = 0; i < 22; i++) {
//         new Worker(__filename, { workerData: buffer });
//     }

//     setTimeout(() => {
//         const array = new Int8Array(buffer, 4);
//         console.log(`Делали броски: ${array[0]}`);
//         console.log(`Тренировали катание: ${array[1]}`);
//     }, 1000);
// } else {
//     const { threadId, workerData } = threads;
//     const semaphore = new BinarySemaphore(workerData);
//     const array = new Int8Array(workerData, 4);

//     semaphore.exec(() => {
//         const [doKicks, doSkating] = array;

//         console.log(`На лед выходит ${threadId}.`);

//         if (doKicks === doSkating) {
//             array[1]++;
//         } else {
//             array[0]++;
//         }
//     });
// }