/**
 * 공통 검증 유틸리티
 */

export function validateContent(content) {
  return content && content.trim().length > 0;
}

export function validateEntry(entry) {
  return entry && 
         entry.id && 
         entry.date && 
         validateContent(entry.content);
}

export function validateEntries(entries) {
  return Array.isArray(entries) && 
         entries.every(validateEntry);
}
