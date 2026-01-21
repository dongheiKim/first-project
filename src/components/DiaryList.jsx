import { memo } from 'react';
import { DiaryEntry } from './DiaryEntry';
import { useTranslation } from '../locales';

/**
 * 일기 목록 컴포넌트
 * @param {Array} entries - 표시할 일기 배열
 * @param {Function} onUpdate - 일기 수정 시 호출되는 콜백
 * @param {Function} onDelete - 일기 삭제 시 호출되는 콜백
 */
const DiaryListComponent = ({ entries, onUpdate, onDelete }) => {
  const t = useTranslation();

  return (
    <div id="diary-list">
      {entries.length === 0 ? (
        <p className="empty-message">{t.emptyMessage}</p>
      ) : (
        entries.map((entry) => (
          <DiaryEntry
            key={entry.id}
            entry={entry}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

export const DiaryList = memo(DiaryListComponent);
