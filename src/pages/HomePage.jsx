import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { DiaryList } from '../components/DiaryList';
import { DateFilter } from '../components/DateFilter';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

/**
 * 홈페이지 - 일기 목록 및 필터
 */
export function HomePage() {
  const { entries, update, delete: deleteEntry } = useApp();
  const [dateFilter, setDateFilter] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredEntries = useMemo(() => {
    if (!dateFilter) return entries;
    return entries.filter((entry) => entry.date.includes(dateFilter));
  }, [entries, dateFilter, refreshKey]);

  // 무한 스크롤
  const { displayedItems, hasMore } = useInfiniteScroll(filteredEntries, 20);

  // Pull-to-Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const pullToRefresh = usePullToRefresh(handleRefresh);

  const handleFilterChange = useCallback((filter) => {
    setDateFilter(filter);
  }, []);

  return (
    <div {...pullToRefresh}>
      {pullToRefresh.pulling && pullToRefresh.pullDistance >= 80 && (
        <div className="pull-to-refresh-indicator" style={{ transform: `translateY(${Math.min(pullToRefresh.pullDistance, 120)}px)` }}>
          🔄 새로고침...
        </div>
      )}
      <DateFilter onFilterChange={handleFilterChange} />
      <DiaryList
        entries={displayedItems}
        onUpdate={update}
        onDelete={deleteEntry}
      />
      {hasMore && (
        <div className="loading-more">
          <div className="loading-more-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
