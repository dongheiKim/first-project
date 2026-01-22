import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTime, isValidDateString } from '../dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('날짜 문자열을 포맷팅한다', () => {
      const date = '2026-01-22';
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('Date 객체도 포맷팅한다', () => {
      const date = new Date('2026-01-22');
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('빈 문자열도 처리한다', () => {
      const result = formatDate('');
      expect(typeof result).toBe('string');
    });

    it('style 옵션을 지원한다', () => {
      const date = '2026-01-22';
      const short = formatDate(date, { style: 'short' });
      const long = formatDate(date, { style: 'long' });
      expect(short).not.toBe(long);
    });
  });

  describe('getRelativeTime', () => {
    it('오늘 날짜는 "오늘"을 반환한다', () => {
      const today = new Date();
      const result = getRelativeTime(today);
      expect(result).toBe('오늘');
    });

    it('어제 날짜는 "어제"를 반환한다', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = getRelativeTime(yesterday);
      expect(result).toBe('어제');
    });
  });

  describe('isValidDateString', () => {
    it('유효한 날짜 문자열은 true를 반환한다', () => {
      expect(isValidDateString('2026-01-22')).toBe(true);
    });

    it('유효하지 않은 날짜 문자열은 false를 반환한다', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
    });
  });
});
