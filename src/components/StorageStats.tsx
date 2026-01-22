import { useMemo, type FC } from 'react';
import { useTranslation } from '../locales';
import type { DiaryEntryData } from './DiaryEntry';

interface StorageStatsProps {
  entries: DiaryEntryData[];
}

/**
 * 저장소 통계 컴포넌트
 */
export const StorageStats: FC<StorageStatsProps> = ({ entries }) => {
  const t = useTranslation();

  const stats = useMemo(() => {
    const jsonStr = JSON.stringify(entries);
    const bytes = jsonStr.length;
    
    return {
      kb: (bytes / 1024).toFixed(2),
      count: entries.length
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="storage-stats">
      <h4>💾 {t.storageStats || '저장소 통계'}</h4>
      <div className="stats-row">
        <span>{t.totalEntries || '총 일기'}:</span>
        <span>{stats.count}개</span>
      </div>
      <div className="stats-row highlight">
        <span>{t.storageSize || '저장 크기'}:</span>
        <span>{stats.kb} KB</span>
      </div>
    </div>
  );
};
