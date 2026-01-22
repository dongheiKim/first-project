export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

export interface DateFormatOptions {
  locale?: string;
  style?: DateFormatStyle;
  includeTime?: boolean;
}

const styleMap: Record<DateFormatStyle, Intl.DateTimeFormatOptions> = {
  short: { year: '2-digit', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
};

export function formatDate(
  date: string | Date,
  options: DateFormatOptions = {}
): string {
  const { locale = 'ko-KR', style = 'medium', includeTime = false } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      ...styleMap[style],
      ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch {
    return String(date);
  }
}

export function getRelativeTime(date: string | Date, _locale: string = 'ko-KR'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch {
    return String(date);
  }
}

export function isValidDateString(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * 기기 시간대를 사용하여 날짜 포맷팅
 */
export function formatDateWithDeviceTimezone(date: Date, locale: string = 'ko-KR'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

/**
 * 언어 코드를 로케일로 변환
 */
export function getLocaleFromLanguage(lang: string): string {
  const localeMap: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ru: 'ru-RU',
    pt: 'pt-BR',
  };
  return localeMap[lang] || 'en-US';
}

/**
 * 날짜 문자열을 안전하게 파싱
 */
export function safeParseDateString(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}
