import { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getTheme, setTheme as saveTheme } from '../translations';
import { getCurrentLanguage, setLanguage as saveLanguage } from '../locales';

/**
 * 앱 전역 상태 컨텍스트
 * 모든 페이지에서 공유하는 상태와 액션을 관리
 */
const AppContext = createContext();

export function AppProvider({ children }) {
  // 상태들
  const [language, setLanguageState] = useState(getCurrentLanguage());
  const [isDarkMode, setIsDarkMode] = useState(getTheme());
  const [entries, setEntries] = useLocalStorage('my_diary_v1', []);

  /**
   * 언어 변경 처리
   * @param {string} lang - 변경할 언어 코드
   */
  const handleSetLanguage = useCallback((lang) => {
    saveLanguage(lang);
    setLanguageState(lang);
  }, []);

  /**
   * 다크모드 토글
   */
  const handleToggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    saveTheme(newMode);
    setIsDarkMode(newMode);
  }, [isDarkMode]);

  /**
   * 새 일기 저장
   * @param {Object} newEntry - 새 일기 객체
   */
  const handleSave = useCallback((newEntry) => {
    setEntries([newEntry, ...entries]);
  }, [entries, setEntries]);

  /**
   * 기존 일기 수정
   * @param {number} id - 일기 ID
   * @param {string} newContent - 수정된 내용
   */
  const handleUpdate = useCallback((id, newContent) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, content: newContent } : entry
      )
    );
  }, [entries, setEntries]);

  /**
   * 일기 삭제
   * @param {number} id - 삭제할 일기 ID
   */
  const handleDelete = useCallback((id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  }, [entries, setEntries]);

  /**
   * 데이터 가져오기 (백업/복원)
   * @param {Array} importedData - 가져온 일기 배열
   */
  const handleImport = useCallback((importedData) => {
    setEntries(importedData);
  }, [setEntries]);

  // 컨텍스트 값
  const value = {
    // 상태
    language,
    isDarkMode,
    entries,
    
    // 액션
    setLanguage: handleSetLanguage,
    toggleDarkMode: handleToggleDarkMode,
    save: handleSave,
    update: handleUpdate,
    delete: handleDelete,
    import: handleImport,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * 앱 컨텍스트 사용 훅
 * @returns {Object} AppContext 값
 * @throws {Error} AppProvider 없이 사용할 경우
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
