import { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation, getCurrentLanguage } from '../locales';
import { formatDateWithDeviceTimezone, getLocaleFromLanguage, safeParseDateString } from '../utils/dateFormatter';

/**
 * 날짜 필터 컴포넌트
 * 일기를 날짜별로 필터링 (전체/오늘/특정 날짜)
 * @param {Function} onFilterChange - 필터 변경 시 호출되는 콜백
 */
const DateFilterComponent = ({ onFilterChange }) => {
  const t = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [todayDate, setTodayDate] = useState('');

  // 컴포넌트 마운트 시 오늘 날짜 설정
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTodayDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // 필터 타입 변경 핸들러
  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
    
    if (type === 'all') {
      onFilterChange(null);
    } else if (type === 'today') {
      const currentLang = getCurrentLanguage();
      const locale = getLocaleFromLanguage(currentLang);
      const today = new Date();
      const todayFormatted = formatDateWithDeviceTimezone(today, locale);
      const datePart = todayFormatted.split(',')[0].trim();
      onFilterChange(datePart);
    } else if (type === 'custom' && selectedDate) {
      const currentLang = getCurrentLanguage();
      const locale = getLocaleFromLanguage(currentLang);
      const customDate = new Date(selectedDate);
      const customFormatted = formatDateWithDeviceTimezone(customDate, locale);
      const datePart = customFormatted.split(',')[0].trim();
      onFilterChange(datePart);
    }
  }, [onFilterChange, selectedDate]);

  // 날짜 선택 핸들러 (날짜 피커)
  const handleDateSelect = useCallback((e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      setFilterType('custom');
      const currentLang = getCurrentLanguage();
      const locale = getLocaleFromLanguage(currentLang);
      const customDate = new Date(date);
      const customFormatted = formatDateWithDeviceTimezone(customDate, locale);
      const datePart = customFormatted.split(',')[0].trim();
      onFilterChange(datePart);
    }
  }, [onFilterChange]);

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
          {todayDate && <span className="today-badge">{todayDate.slice(5, 10)}</span>}
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateSelect}
          className="date-picker"
          max={todayDate}
        />
      </div>
    </div>
  );
};

export const DateFilter = memo(DateFilterComponent);