import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getCurrentLanguage, setLanguage as saveLanguage } from '../locales';

const AppContext = createContext();

/**
 * 테마 관리 함수들
 */
function getTheme() {
  const saved = localStorage.getItem('app_theme');
  if (saved) {
    return saved === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function saveTheme(isDark) {
  localStorage.setItem('app_theme', isDark ? 'dark' : 'light');
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

/**
 * 앱 전역 상태 제공자
 */
export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(getCurrentLanguage());
  const [isDarkMode, setIsDarkMode] = useState(getTheme());
  const [entries, setEntries] = useLocalStorage('my_diary_v1', []);

  // 초기 테마 적용
  useEffect(() => {
    saveTheme(isDarkMode);
  }, []);

  const setLanguage = useCallback((lang) => {
    saveLanguage(lang);
    setLanguageState(lang);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    saveTheme(newMode);
    setIsDarkMode(newMode);
  }, [isDarkMode]);

  const save = useCallback((newEntry) => {
    setEntries(prev => [newEntry, ...prev]);
  }, [setEntries]);

  const update = useCallback((id, updates) => {
    setEntries(prev =>
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );
  }, [setEntries]);

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setEntries]);

  const importData = useCallback((data) => {
    setEntries(data);
  }, [setEntries]);

  const value = {
    language,
    isDarkMode,
    entries,
    setLanguage,
    toggleDarkMode,
    save,
    update,
    delete: deleteEntry,
    import: importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
