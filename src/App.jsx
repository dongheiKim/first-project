import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTranslation, getCurrentLanguage, setLanguage, getSupportedLanguages } from './translations';
import { DiaryInput } from './components/DiaryInput';
import { DiaryList } from './components/DiaryList';
import { ConfirmModal } from './components/ConfirmModal';
import { DateFilter } from './components/DateFilter';
import './style.css';

function App() {
  const t = useTranslation(); // 현재 언어의 번역 객체 가져오기
  const [entries, setEntries] = useLocalStorage('my_diary_v1', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  // 저장 버튼 클릭 시 - 모달 표시
  const handleSaveRequest = (content) => {
    setPendingContent(content);
    setIsModalOpen(true);
  };

  // 모달에서 확인 버튼 클릭
  const handleConfirmSave = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      content: pendingContent
    };

    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
    setPendingContent('');
  };

  // 모달 취소
  const handleCancelSave = () => {
    setIsModalOpen(false);
    setPendingContent('');
  };

  // 일기 수정
  const handleUpdate = (id, newContent) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, content: newContent } : entry
      )
    );
  };

  // 일기 삭제
  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // 날짜 필터링된 일기 목록
  const filteredEntries = useMemo(() => {
    if (!dateFilter) return entries;
    
    return entries.filter((entry) => entry.date.includes(dateFilter));
  }, [entries, dateFilter]);

  return (
    <div className="container">
      <h1>{t.appTitle}</h1>
      
      {/* 언어 선택기 */}
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
              title={langNames[lang]}
            >
              {langNames[lang]}
            </button>
          );
        })}
      </div>
      
      <DiaryInput onSave={handleSaveRequest} />
      
      <DateFilter onFilterChange={setDateFilter} />
      
      <DiaryList
        entries={filteredEntries}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <ConfirmModal
        isOpen={isModalOpen}
        message={t.confirmMessage}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  );
}

export default App;
