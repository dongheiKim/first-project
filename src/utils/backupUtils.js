/**
 * 백업 관련 유틸리티 함수 (개선됨)
 */

import { compressData, decompressData } from './compression';
import { compressDataAsync, decompressDataAsync } from './workerManager';

const FILE_SIZE_LIMITS = {
  LOCAL: 50 * 1024 * 1024, // 50MB (로컬)
  CLOUD: 25 * 1024 * 1024, // 25MB (구글 드라이브)
  WORKER_THRESHOLD: 1 * 1024 * 1024, // 1MB 이상이면 Worker 사용
};

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DELAY_MS: 1000,
};

/**
 * 파일 크기에 따라 Worker 또는 메인 스레드에서 데이터 압축
 */
async function compressWithWorker(entries) {
  const estimatedSize = JSON.stringify(entries).length;
  if (estimatedSize > FILE_SIZE_LIMITS.WORKER_THRESHOLD) {
    try {
      return await compressDataAsync(entries);
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('Worker compression failed, using main thread:', error);
      }
      return compressData(entries);
    }
  }
  return compressData(entries);
}

/**
 * 파일 크기에 따라 Worker 또는 메인 스레드에서 데이터 압축 해제
 */
async function decompressWithWorker(compressed) {
  const estimatedSize = JSON.stringify(compressed).length;
  if (estimatedSize > FILE_SIZE_LIMITS.WORKER_THRESHOLD) {
    try {
      return await decompressDataAsync(compressed);
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('Worker decompression failed, using main thread:', error);
      }
      return decompressData(compressed);
    }
  }
  return decompressData(compressed);
}

/**
 * 재시도 로직이 포함된 비동기 함수 실행
 */
async function withRetry(fn, maxRetries = RETRY_CONFIG.MAX_RETRIES) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.DELAY_MS * (i + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * 로컬 데이터 내보내기 (JSON 파일 다운로드, 크기 검증)
 * @param {Array} entries - 내보낼 일기 배열
 * @param {Function} onMessage - 메시지 콜백 (type: 'success'|'error', message: string)
 * @returns {Object} {success: boolean, fileSize?: string}
 */
export function exportLocalData(entries, onMessage) {
  if (!onMessage || typeof onMessage !== 'function') {
    throw new Error('onMessage callback is required');
  }

  if (entries.length === 0) {
    onMessage({ type: 'error', message: 'noDataToExport' });
    return { success: false };
  }

  try {
    // 데이터 압축 (Worker 사용 가능)1
    const compressed = compressWithWorker(entries);
    const dataStr = JSON.stringify(compressed);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // 파일 크기 검증
    if (dataBlob.size > FILE_SIZE_LIMITS.LOCAL) {
      onMessage({
        type: 'error',
        message: `File too large: ${(dataBlob.size / 1024 / 1024).toFixed(1)}MB`,
      });
      return { success: false };
    }

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    
    // 파일명에 날짜 포함
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `diary-backup-${timestamp}.json`;
    link.href = url;
    link.click();
    
    // 메모리 정리
    setTimeout(() => URL.revokeObjectURL(url), 100);

    const originalSize = JSON.stringify(entries).length;
    const reduction = ((1 - dataStr.length / originalSize) * 100).toFixed(1);

    onMessage({
      type: 'success',
      message: `Exported: ${(originalSize / 1024).toFixed(1)}KB → ${(dataBlob.size / 1024).toFixed(1)}KB (${reduction}% reduced)`,
    });

    return { success: true, fileSize: `${(dataBlob.size / 1024).toFixed(1)}KB` };
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Export error:', error);
    }
    onMessage({
      type: 'error',
      message: `Export failed: ${error.message}`,
    });
    return { success: false };
  }
}

/**
 * 파일에서 데이터 가져오기 (크기 검증, 재시도 로직)
 * @param {string} fileContent - 파일 내용
 * @param {Array} entries - 기존 일기 배열
 * @param {Function} onMessage - 메시지 콜백
 * @param {Function} onConfirm - 확인 콜백 (기존 데이터 덮어쓰기 여부)
 * @returns {Promise<Array|null>} 검증된 일기 배열 또는 null
 */
export async function importLocalData(fileContent, entries, onMessage, onConfirm) {
  if (!onMessage || typeof onMessage !== 'function') {
    throw new Error('onMessage callback is required');
  }

  try {
    // 파일 크기 검증
    const fileSize = new Blob([fileContent]).size;
    if (fileSize > FILE_SIZE_LIMITS.LOCAL) {
      onMessage({
        type: 'error',
        message: `File too large: ${(fileSize / 1024 / 1024).toFixed(1)}MB`,
      });
      return null;
    }

    // JSON 파싱 (재시도 포함)
    let parsedData;
    try {
      parsedData = JSON.parse(fileContent);
    } catch (parseError) {
      onMessage({
        type: 'error',
        message: 'Invalid JSON format',
      });
      return null;
    }
    
    // 압축된 데이터인지 확인 (키가 i, d, c인지 체크)
    let importedData;
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      if (parsedData[0].i !== undefined) {
        // 압축된 데이터 해제 (Worker 사용 가능)
        importedData = await decompressWithWorker(parsedData);
      } else if (parsedData[0].id !== undefined) {
        // 이미 압축되지 않은 데이터
        importedData = parsedData;
      } else {
        throw new Error('Invalid entry format');
      }
    } else {
      throw new Error('Empty data');
    }

    // 데이터 검증
    const isValid = importedData.every(
      (entry) => entry.id && entry.date && entry.content
    );

    if (!isValid) {
      throw new Error('Invalid entry format');
    }

    // 기존 데이터 확인
    if (entries.length > 0 && onConfirm) {
      const confirmed = await onConfirm('Overwrite existing data?');
      if (!confirmed) {
        onMessage({ type: 'info', message: 'Import cancelled' });
        return null;
      }
    }

    onMessage({
      type: 'success',
      message: `Imported ${importedData.length} entries`,
    });

    return importedData;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Import error:', error);
    }
    onMessage({
      type: 'error',
      message: `Import failed: ${error.message}`,
    });
    return null;
  }
}

/**
 * 클라우드 데이터 업로드 (구글 드라이브, 재시도 로직, Worker)
 * @param {Array} entries - 업로드할 일기 배열
 * @param {Function} onMessage - 메시지 콜백
 * @param {Function} uploadFn - 업로드 함수
 * @returns {Promise<boolean>} 성공 여부
 */
export async function uploadCloudData(entries, onMessage, uploadFn) {
  if (!onMessage || typeof onMessage !== 'function') {
    throw new Error('onMessage callback is required');
  }

  if (entries.length === 0) {
    onMessage({ type: 'error', message: 'noDataToExport' });
    return false;
  }

  try {
    onMessage({ type: 'info', message: 'Uploading...' });

    // 데이터 압축 (Worker 사용 가능)
    const compressed = await compressWithWorker(entries);
    const dataStr = JSON.stringify(compressed);
    const fileSize = new Blob([dataStr]).size;

    if (fileSize > FILE_SIZE_LIMITS.CLOUD) {
      onMessage({
        type: 'error',
        message: `File too large: ${(fileSize / 1024 / 1024).toFixed(1)}MB`,
      });
      return false;
    }

    // 재시도 로직 포함 업로드
    await withRetry(async () => {
      await uploadFn('diary-backup.json', dataStr);
    });

    const originalSize = JSON.stringify(entries).length;
    const reduction = ((1 - dataStr.length / originalSize) * 100).toFixed(1);
    onMessage({
      type: 'success',
      message: `Uploaded: ${reduction}% reduced`,
    });

    return true;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Upload error:', error);
    }
    onMessage({
      type: 'error',
      message: `Upload failed: ${error.message}`,
    });
    return false;
  }
}

/**
 * 클라우드 데이터 다운로드 (구글 드라이브, 재시도 로직, Worker)
 * @param {Array} entries - 기존 일기 배열
 * @param {Function} onMessage - 메시지 콜백
 * @param {Function} downloadFn - 다운로드 함수
 * @param {Function} onConfirm - 확인 콜백
 * @returns {Promise<Array|null>} 검증된 일기 배열 또는 null
 */
export async function downloadCloudData(entries, onMessage, downloadFn, onConfirm) {
  if (!onMessage || typeof onMessage !== 'function') {
    throw new Error('onMessage callback is required');
  }

  try {
    onMessage({ type: 'info', message: 'Downloading...' });

    // 재시도 로직 포함 다운로드
    let dataStr;
    await withRetry(async () => {
      dataStr = await downloadFn('diary-backup.json');
    });

    const parsedData = JSON.parse(dataStr);

    // 압축된 데이터 해제 (Worker 사용 가능)
    let importedData;
    if (parsedData.length > 0 && parsedData[0].i !== undefined) {
      importedData = await decompressWithWorker(parsedData);
    } else {
      importedData = parsedData;
    }

    // 데이터 검증
    if (!Array.isArray(importedData)) {
      throw new Error('Invalid format');
    }

    // 기존 데이터 확인
    if (entries.length > 0 && onConfirm) {
      const confirmed = await onConfirm('Overwrite existing data?');
      if (!confirmed) {
        onMessage({ type: 'info', message: 'Download cancelled' });
        return null;
      }
    }

    onMessage({
      type: 'success',
      message: `Downloaded ${importedData.length} entries`,
    });

    return importedData;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Download error:', error);
    }
    onMessage({
      type: 'error',
      message: `Download failed: ${error.message}`,
    });
    return null;
  }
}
