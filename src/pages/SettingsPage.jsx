import { useApp } from '../context/AppContext';
import { BackupRestore } from '../components/BackupRestore';
import { useTranslation, getCurrentLanguage, setLanguage, getSupportedLanguages } from '../locales';
import { getTimezoneDisplay } from '../utils/dateFormatter';

/**
 * 설정 페이지
 */
export function SettingsPage() {
  const { entries, import: importData, isDarkMode, toggleDarkMode } = useApp();
  const t = useTranslation();

  return (
    <div className="settings-page">
      <h2>⚙️ {t.settingsTitle}</h2>
      
      <div className="settings-section">
        <h3>🕐 {t.timezoneInfo}</h3>
        <div className="timezone-display">
          <p>{getTimezoneDisplay()}</p>
          <small>{t.timezoneNote}</small>
        </div>
      </div>

      <div className="settings-section">
        <h3>🌙 {t.themeSettings}</h3>
        <button className="theme-toggle-btn-large" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️ ' + t.lightMode : '🌙 ' + t.darkMode}
        </button>
      </div>

      <div className="settings-section">
        <h3>🌍 {t.languageSettings}</h3>
        <div className="language-selector">
          {getSupportedLanguages().map((lang) => {
            const langNames = {
              ko: '🇰🇷 한글',
              en: '🇺🇸 English',
              ja: '🇯🇵 日本語',
              zh: '🇨🇳 中文',
              es: '🇪🇸 Español',
              fr: '🇫🇷 Français',
              de: '🇩🇪 Deutsch',
              ru: '🇷🇺 Русский',
              pt: '🇵🇹 Português',
            };
            return (
              <button
                key={lang}
                className={`lang-btn ${getCurrentLanguage() === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {langNames[lang]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <BackupRestore entries={entries} onImport={importData} />
      </div>
    </div>
  );
}

export default SettingsPage;
