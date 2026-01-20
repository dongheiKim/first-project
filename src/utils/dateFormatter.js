/**
 * 날짜 및 시간대 포맷팅 유틸리티
 * 사용자 기기의 현지 시간대를 자동으로 감지하여 적용
 */

/**
 * 현재 시간대 가져오기
 * @returns {string} 시간대 (예: "Asia/Seoul", "America/New_York")
 */
export function getCurrentTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 언어별 로케일 매핑
 */
export function getLocaleFromLanguage(lang) {
  const localeMap = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ru: 'ru-RU',
    pt: 'pt-PT'
  };
  return localeMap[lang] || 'en-US';
}

/**
 * 사용자 기기의 현지 시간으로 날짜 포맷팅
 * 언어 설정과 무관하게 기기 시간대 사용
 * @param {Date} date - 포맷팅할 날짜
 * @param {string} locale - 로케일 (예: 'ko-KR')
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDateWithDeviceTimezone(date, locale) {
  // 기기의 시간대 자동 감지 (toLocaleString이 자동으로 처리)
  return date.toLocaleString(locale);
}

/**
 * ISO 문자열을 기기 로컬 시간으로 변환
 * @param {string} isoString - ISO 8601 날짜 문자열
 * @param {string} locale - 로케일
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function parseISOToDeviceLocal(isoString, locale) {
  const date = new Date(isoString);
  return date.toLocaleString(locale);
}

/**
 * 날짜 문자열을 Date 객체로 안전하게 파싱
 * @param {string} dateStr - 날짜 문자열
 * @returns {Date|null} Date 객체 또는 null
 */
export function safeParseDateString(dateStr) {
  try {
    // ISO 형식 시도
    if (dateStr.includes('T') || dateStr.includes('Z')) {
      return new Date(dateStr);
    }
    
    // 다양한 형식 시도
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // 숫자만 추출하여 파싱
    const numbers = dateStr.match(/\d+/g);
    if (numbers && numbers.length >= 3) {
      const year = parseInt(numbers[0]);
      const month = parseInt(numbers[1]) - 1;
      const day = parseInt(numbers[2]);
      return new Date(year, month, day);
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

/**
 * 시간대 정보 표시용 문자열
 * @returns {string} 시간대 표시 (예: "GMT+9", "GMT-5")
 */
export function getTimezoneDisplay() {
  const timezone = getCurrentTimezone();
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  
  return `${timezone} (GMT${sign}${hours}${minutes > 0 ? ':' + minutes : ''})`;
}
