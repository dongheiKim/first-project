import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DiaryInput } from '../components/DiaryInput';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTranslation, getCurrentLanguage } from '../locales';
import { formatDateWithDeviceTimezone, getLocaleFromLanguage } from '../utils/dateFormatter';

/**
 * 일기 작성 페이지
 */
export function WritePage() {
  const { save } = useApp();
  const t = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState('');
  const [shouldClearInput, setShouldClearInput] = useState(false);

  /**
   * 저장 요청 (모달 열기)
   */
  const handleSaveRequest = (content) => {
    setPendingContent(content);
    setIsModalOpen(true);
  };

  /**
   * 저장 확인 (모달에서 확인 버튼 클릭)
   */
  const handleConfirmSave = () => {
    const currentLang = getCurrentLanguage();
    const locale = getLocaleFromLanguage(currentLang);
    const now = new Date();

    // 새 일기 객체 생성 (기기의 로컬 시간대 적용)
    const newEntry = {
      id: Date.now(),
      date: formatDateWithDeviceTimezone(now, locale),
      content: pendingContent
    };

    save(newEntry);
    setIsModalOpen(false);
    setPendingContent('');
    setShouldClearInput(true);
    
    // 저장 후 홈으로 이동
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div>
      <DiaryInput 
        onSave={handleSaveRequest} 
        shouldClear={shouldClearInput}
        onCleared={() => setShouldClearInput(false)}
        pendingContent={pendingContent}
      />
      
      <ConfirmModal
        isOpen={isModalOpen}
        message={t.confirmMessage}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default WritePage;
