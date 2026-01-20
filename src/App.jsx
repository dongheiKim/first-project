import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { useTranslation } from './locales';
import './style.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const WritePage = lazy(() => import('./pages/WritePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

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

function AppContent() {
  const { isDarkMode, toggleDarkMode } = useApp();
  const t = useTranslation();

  return (
    <div className="container">
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

      <Navigation />

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