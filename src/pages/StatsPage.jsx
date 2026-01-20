import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import { safeParseDateString } from '../utils/dateFormatter';

/**
 * 통계 대시보드 페이지
 */
export function StatsPage() {
  const { entries } = useApp();
  const t = useTranslation();

  const stats = useMemo(() => {
    const total = entries.length;
    
    const thisMonth = entries.filter(entry => {
      const entryDate = safeParseDateString(entry.date);
      if (!entryDate) return false;
      
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    }).length;

    const avgLength = total > 0 
      ? Math.round(entries.reduce((sum, e) => sum + e.content.length, 0) / total)
      : 0;

    return { total, thisMonth, avgLength };
  }, [entries]);

  return (
    <div className="stats-page">
      <h2>📊 {t.statsTitle}</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-emoji">📝</span>
          <h3>{stats.total}</h3>
          <p>{t.totalEntries}</p>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">📅</span>
          <h3>{stats.thisMonth}</h3>
          <p>{t.thisMonth}</p>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">✍️</span>
          <h3>{stats.avgLength}</h3>
          <p>{t.avgLength}</p>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
