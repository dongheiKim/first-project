/**
 * 데이터 압축 및 최적화 유틸리티
 */

/**
 * 데이터 압축 (키 이름 단축)
 * @param {Array} entries - 압축할 일기 배열
 * @returns {Array} 압축된 배열
 */
export function compressData(entries) {
  return entries.map(entry => ({
    i: entry.id,
    d: entry.date,
    c: entry.content
  }));
}

/**
 * 압축된 데이터 복원
 * @param {Array} compressed - 압축된 배열
 * @returns {Array} 원본 배열
 */
export function decompressData(compressed) {
  return compressed.map(entry => ({
    id: entry.i,
    date: entry.d,
    content: entry.c
  }));
}
