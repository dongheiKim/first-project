/**
 * Web Worker 관리 유틸리티
 * 메인 스레드 블로킹 방지
 */

let worker = null;
let messageId = 0;
const pendingMessages = new Map();

/**
 * Worker 초기화 (싱글톤)
 */
function getWorker() {
  if (!worker && typeof Worker !== 'undefined') {
    try {
      // Vite 환경에서 Worker 로드
      worker = new Worker(new URL('./dataProcessor.worker.js', import.meta.url), { type: 'module' });
      
      // Worker 메시지 처리
      worker.onmessage = (event) => {
        const { messageId: id, type, result, error } = event.data;
        const callback = pendingMessages.get(id);
        
        if (callback) {
          if (error) {
            callback.reject(new Error(error));
          } else {
            callback.resolve(result);
          }
          pendingMessages.delete(id);
        }
      };

      worker.onerror = (error) => {
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.error('Worker error:', error);
        }
        // 모든 pending 요청 거부
        pendingMessages.forEach(({ reject }) => {
          reject(error);
        });
        pendingMessages.clear();
      };
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('Worker not available:', error);
      }
      return null;
    }
  }
  return worker;
}

/**
 * Worker에 작업 요청
 */
function sendWorkerMessage(type, data) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    const timeout = setTimeout(() => {
      pendingMessages.delete(id);
      reject(new Error(`Worker timeout: ${type}`));
    }, 30000); // 30초 타임아웃

    pendingMessages.set(id, {
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    });

    const w = getWorker();
    if (w) {
      w.postMessage({ messageId: id, type, data });
    } else {
      // Worker 사용 불가능 - 메인 스레드에서 실행
      pendingMessages.delete(id);
      resolve(null); // fallback
    }
  });
}

/**
 * Worker 종료
 */
export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    messageId = 0;
    pendingMessages.clear();
  }
}

/**
 * 데이터 압축 (Worker 사용)
 */
export async function compressDataAsync(entries) {
  const w = getWorker();
  if (!w) {
    // Fallback: 메인 스레드에서 압축
    return entries.map(entry => ({
      i: entry.id,
      d: entry.date,
      c: entry.content,
      ...(entry.images && { img: entry.images }),
    }));
  }
  return sendWorkerMessage('COMPRESS', entries);
}

/**
 * 데이터 압축 해제 (Worker 사용)
 */
export async function decompressDataAsync(compressed) {
  const w = getWorker();
  if (!w) {
    // Fallback: 메인 스레드에서 압축 해제
    return compressed.map(item => ({
      id: item.i,
      date: item.d,
      content: item.c,
      ...(item.img && { images: item.img }),
    }));
  }
  return sendWorkerMessage('DECOMPRESS', compressed);
}

/**
 * 데이터 검증 (Worker 사용)
 */
export async function validateDataAsync(data) {
  const w = getWorker();
  if (!w) {
    // Fallback: 메인 스레드에서 검증
    return Array.isArray(data) && data.every(entry => 
      entry.i && entry.d && entry.c
    );
  }
  return sendWorkerMessage('VALIDATE', data);
}

/**
 * JSON 배치 처리 (Worker 사용)
 */
export async function processBatchAsync(batch, operation) {
  const w = getWorker();
  if (!w) {
    // Fallback: 메인 스레드에서 처리
    if (operation === 'PARSE_JSON') {
      return JSON.parse(batch);
    } else if (operation === 'STRINGIFY') {
      return JSON.stringify(batch);
    }
    return batch;
  }
  return sendWorkerMessage('PROCESS_BATCH', { batch, operation });
}
