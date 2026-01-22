import { Suspense, lazy, type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { useTranslation } from './locales';
import { ROUTES } from './utils/constants';
import './styles/main.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const WritePage = lazy(() => import('./pages/WritePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const LoadingFallback: FC = () => (
  <div className="loading-container">
    <p>⏳ 로딩 중...</p>
  </div>
);

const AppContent: FC = () => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const t = useTranslation();

  return (
    <div className="container">
      <header className="header">
        <h1>{t.appTitle}</h1>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleDarkMode} 
          title={isDarkMode ? t.lightMode : t.darkMode}
          aria-label={isDarkMode ? t.lightMode : t.darkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <Navigation />

      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.WRITE} element={<WritePage />} />
            <Route path={ROUTES.STATS} element={<StatsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App: FC = () => (
  <AppProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AppProvider>
);

export default App;
