import { useState } from 'react';
import { useTranslation } from '../translations';
import '../style.css';

/**
 * 날짜 필터 컴포넌트
 * 일기를 날짜별로 필터링하는 UI 제공 (전체/오늘/특정 날짜)
 * @param {Function} onFilterChange - 필터 변경 시 호출되는 콜백
 */
export function DateFilter({ onFilterChange }) {
  const t = useTranslation();
  const [filterType, setFilterType] = useState('all'); // 필터 타입 (all/today/custom)
  const [selectedDate, setSelectedDate] = useState(''); // 선택된 날짜

  // 필터 타입 변경 핸들러
  const handleFilterChange = (type) => {
    setFilterType(type);
    
    if (type === 'all') {
      onFilterChange(null);
    } else if (type === 'today') {
      const today = new Date().toLocaleDateString('ko-KR');
      onFilterChange(today);
    } else if (type === 'custom' && selectedDate) {
      const customDate = new Date(selectedDate).toLocaleDateString('ko-KR');
      onFilterChange(customDate);
    }
  };

  // 날짜 선택 핸들러 (날짜 피커)
  const handleDateSelect = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      setFilterType('custom');
      const customDate = new Date(date).toLocaleDateString('ko-KR');
      onFilterChange(customDate);
    }
  };

  return (
    <div className="filter-section">
      <div className="filter-buttons">
        <button
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => handleFilterChange('all')}
        >
          {t.filterAll}
        </button>
        <button
          className={filterType === 'today' ? 'active' : ''}
          onClick={() => handleFilterChange('today')}
        >
          {t.filterToday}
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateSelect}
          className="date-picker"
        />
      </div>
    </div>
  );
}
