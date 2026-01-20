/**
 * 백업 관련 유틸리티 함수
 */

import { compressData, decompressData } from './compression';

/**
 * 로컬 데이터 내보내기 (JSON 파일 다운로드)
 * @param {Array} entries - 내보낼 일기 배열
 * @param {Object} t - 번역 객체
 */
export function exportLocalData(entries, t) {
  if (entries.length === 0) {
    alert(t.noDataToExport);
    return;
  }

  // 데이터 압축
  const compressed = compressData(entries);
  const dataStr = JSON.stringify(compressed);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  
  // 파일명에 날짜 포함
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `diary-backup-${timestamp}.json`;
  link.href = url;
  link.click();
  
  // 메모리 정리
  URL.revokeObjectURL(url);
  alert(t.exportSuccess);
}

/**
 * 파일에서 데이터 가져오기 (JSON 파일 업로드)
 * @param {string} fileContent - 파일 내용
 * @param {Array} entries - 기존 일기 배열
 * @param {Object} t - 번역 객체
 * @returns {Array|null} 검증된 일기 배열 또는 null
 */
export function importLocalData(fileContent, entries, t) {
  try {
    const parsedData = JSON.parse(fileContent);
    
    // 압축된 데이터인지 확인 (키가 i, d, c인지 체크)
    let importedData;
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      if (parsedData[0].i !== undefined) {
        // 압축된 데이터 해제
        importedData = decompressData(parsedData);
      } else if (parsedData[0].id !== undefined) {
        // 이미 압축되지 않은 데이터
        importedData = parsedData;
      } else {
        throw new Error('Invalid format');
      }
    } else {
      throw new Error('Invalid format');
    }

    // 데이터 검증
    const isValid = importedData.every(
      (entry) => entry.id && entry.date && entry.content
    );

    if (!isValid) {
      throw new Error('Invalid entry format');
    }

    // 기존 데이터 확인
    if (entries.length > 0) {
      if (!window.confirm(t.confirmImport)) {
        return null;
      }
    }

    return importedData;
  } catch (error) {
    alert(t.importError);
    console.error('Import error:', error);
    return null;
  }
}

/**
 * 클라우드 데이터 업로드 (구글 드라이브)
 * @param {Array} entries - 업로드할 일기 배열
 * @param {Object} t - 번역 객체
 * @param {Function} uploadFn - 업로드 함수
 * @returns {Promise<boolean>} 성공 여부
 */
export async function uploadCloudData(entries, t, uploadFn) {
  if (entries.length === 0) {
    alert(t.noDataToExport);
    return false;
  }

  try {
    // 데이터 압축 및 업로드
    const compressed = compressData(entries);
    const dataStr = JSON.stringify(compressed);
    await uploadFn('diary-backup.json', dataStr);
    
    // 압축률 표시
    const reduction = ((1 - dataStr.length / JSON.stringify(entries).length) * 100).toFixed(1);
    alert(`${t.syncSuccess}\n크기 감소: ${reduction}%`);
    return true;
  } catch (error) {
    console.error('Upload error:', error);
    alert(t.syncError);
    return false;
  }
}

/**
 * 클라우드 데이터 다운로드 (구글 드라이브)
 * @param {Array} entries - 기존 일기 배열
 * @param {Object} t - 번역 객체
 * @param {Function} downloadFn - 다운로드 함수
 * @returns {Promise<Array|null>} 검증된 일기 배열 또는 null
 */
export async function downloadCloudData(entries, t, downloadFn) {
  try {
    // 클라우드에서 파일 다운로드
    const dataStr = await downloadFn('diary-backup.json');
    const parsedData = JSON.parse(dataStr);

    // 압축된 데이터 해제
    let importedData;
    if (parsedData.length > 0 && parsedData[0].i !== undefined) {
      importedData = decompressData(parsedData);
    } else {
      importedData = parsedData;
    }

    // 데이터 검증
    if (!Array.isArray(importedData)) {
      throw new Error('Invalid format');
    }

    // 기존 데이터 확인
    if (entries.length > 0) {
      if (!window.confirm(t.confirmImport)) {
        return null;
      }
    }

    return importedData;
  } catch (error) {
    console.error('Download error:', error);
    alert(t.syncError);
    return null;
  }
}
