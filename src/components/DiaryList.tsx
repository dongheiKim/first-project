import { memo, type FC } from 'react';
import { DiaryEntry, type DiaryEntryData } from './DiaryEntry';
import { useTranslation } from '../locales';

interface DiaryListProps {
  entries: DiaryEntryData[];
  onUpdate: (id: string, data: Partial<DiaryEntryData>) => void;
  onDelete: (id: string) => void;
}

/**
 * 일기 목록 컴포넌트
 */
const DiaryListComponent: FC<DiaryListProps> = ({ entries, onUpdate, onDelete }) => {
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
