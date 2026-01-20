import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { useTranslation } from './locales';
import './style.css';

/**
 * 동적 import로 Code Splitting 적용
 * 각 페이지는 필요할 때만 로드됨
 */
const HomePage = lazy(() => import('./pages/HomePage'));
const WritePage = lazy(() => import('./pages/WritePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * 페이지 로딩 중 표시되는 폴백 컴포넌트
 */
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '1.5rem',
    }}>
      ⏳ 로딩 중...
    </div>
  );
}

/**
 * 앱 내부 컴포넌트 (AppContext 사용)
 * AppProvider 내부에서만 useApp 훅 사용 가능
 */
function AppContent() {
  const { isDarkMode, toggleDarkMode } = useApp();
  const t = useTranslation();

  return (
    <div className="container">
      {/* 헤더 */}
      <div className="header">
        <h1>{t.appTitle}</h1>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleDarkMode} 
          title={isDarkMode ? t.lightMode : t.darkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* 네비게이션 */}
      <Navigation />

      {/* 라우팅된 페이지 (Suspense로 로딩 처리) */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

/**
 * 메인 App 컴포넌트
 * AppProvider로 감싸서 전역 상태 제공
 */
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;