import { DiaryEntry } from './DiaryEntry';
import { useTranslation } from '../translations';
import '../style.css';

/**
 * 일기 목록 컴포넌트
 * 여러 개의 일기 항목을 렌더링하고 빈 상태를 처리
 * @param {Array} entries - 일기 데이터 배열
 * @param {Function} onUpdate - 일기 수정 콜백
 * @param {Function} onDelete - 일기 삭제 콜백
 */
export function DiaryList({ entries, onUpdate, onDelete }) {
  const t = useTranslation();
  // 일기가 없을 때 빈 상태 메시지 표시
  if (entries.length === 0) {
    return <div className="empty-message">{t.emptyMessage}</div>;
  }

  return (
    <div id="diary-list">
      {entries.map((entry) => (
        <DiaryEntry
          key={entry.id}
          entry={entry}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
