import { useState, useEffect } from 'react';

/**
 * localStorage를 React 상태로 관리하는 커스텀 훅
 * @param {string} key - localStorage 키
 * @param {any} initialValue - 초기값
 * @returns {[any, Function]} - [값, 설정함수]
 */
export function useLocalStorage(key, initialValue) {
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`localStorage 읽기 오류 (${key}):`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`localStorage 쓰기 오류 (${key}):`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  return [storedValue, setValue];
}
