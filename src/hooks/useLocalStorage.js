import { useState, useEffect, useCallback } from 'react';
import { compressData, decompressData } from '../utils/compression';

/**
 * localStorage를 React 상태로 관리하는 커스텀 훅
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // 압축 데이터 확인 및 복원
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].i) {
        return decompressData(parsed);
      }
      
      return parsed;
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`localStorage 읽기 오류 (${key}):`, error);
      }
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        const compressed = Array.isArray(valueToStore) 
          ? compressData(valueToStore)
          : valueToStore;
        
        window.localStorage.setItem(key, JSON.stringify(compressed));
      }
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`localStorage 쓰기 오류 (${key}):`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
