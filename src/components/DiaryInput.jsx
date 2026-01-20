import { useEffect, useRef } from 'react';
import { useTranslation } from '../locales';
import '../style.css';

/**
 * 일기 입력 폼 컴포넌트
 * @param {Function} onSave - 저장 버튼 클릭 시 호출되는 콜백
 * @param {boolean} shouldClear - 입력 필드를 초기화할지 여부
 * @param {Function} onCleared - 필드 초기화 완료 후 호출되는 콜백
 * @param {string} pendingContent - 저장 대기 중인 내용
 */
export function DiaryInput({ onSave, shouldClear, onCleared, pendingContent }) {
  const t = useTranslation();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (shouldClear && textareaRef.current) {
      textareaRef.current.value = '';
      onCleared();
    }
  }, [shouldClear, onCleared]);

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      const content = textareaRef.current.value.trim();
      if (!content) {
        alert(t.contentRequired);
        return;
      }
      onSave(content);
    }
  };

  const handleSaveClick = () => {
    const content = textareaRef.current.value.trim();
    if (!content) {
      alert(t.contentRequired);
      return;
    }
    onSave(content);
  };

  return (
    <div className="input-section">
      <textarea
        ref={textareaRef}
        placeholder={t.inputPlaceholder}
        onKeyDown={handleKeyDown}
        defaultValue={pendingContent}
      />
      <button onClick={handleSaveClick}>{t.saveButton}</button>
    </div>
  );
}