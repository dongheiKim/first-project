export interface WorkerMessage<T> {
  type: 'process' | 'result' | 'error';
  data: T;
}

export function runWorker<T, R>(worker: Worker, data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent<WorkerMessage<R>>) => {
      if (event.data.type === 'result') {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        resolve(event.data.data);
      } else if (event.data.type === 'error') {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        reject(new Error('Worker processing error'));
      }
    };

    const handleError = (error: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      reject(error);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.postMessage({ type: 'process', data });
  });
}

export function terminateWorker(worker: Worker): void {
  worker.terminate();
}
