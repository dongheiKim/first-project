import { useState } from 'react';
import { useTranslation } from '../translations';
import '../style.css';

/**
 * 일기 입력 컴포넌트
 * 사용자가 새로운 일기를 작성할 수 있는 텍스트 입력 영역
 * @param {Function} onSave - 저장 버튼 클릭 시 호출되는 콜백 함수
 */
export function DiaryInput({ onSave }) {
  const t = useTranslation();
  const [content, setContent] = useState('');

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!content.trim()) {
      alert(t.contentRequired);
      return;
    }
    onSave(content);
    setContent(''); // 저장 후 입력창 초기화
  };

  // 키보드 단축키 핸들러 (Ctrl + Enter)
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="input-section">
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={t.inputPlaceholder}
      />
      <button onClick={handleSave}>{t.saveButton}</button>
    </div>
  );
}
