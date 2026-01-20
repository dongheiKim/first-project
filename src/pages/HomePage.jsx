import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DiaryList } from '../components/DiaryList';
import { DateFilter } from '../components/DateFilter';

/**
 * 홈페이지 - 일기 목록 및 필터
 */
export function HomePage() {
  const { entries, update, delete: deleteEntry } = useApp();
  const [dateFilter, setDateFilter] = useState(null);

  const filteredEntries = useMemo(() => {
    if (!dateFilter) return entries;
    return entries.filter((entry) => entry.date.includes(dateFilter));
  }, [entries, dateFilter]);

  return (
    <div>
      <DateFilter onFilterChange={setDateFilter} />
      <DiaryList
        entries={filteredEntries}
        onUpdate={update}
        onDelete={deleteEntry}
      />
    </div>
  );
}

export default HomePage;
