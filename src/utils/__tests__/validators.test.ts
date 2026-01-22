import { describe, it, expect } from 'vitest';
import { isValidEntry } from '../validators';

describe('validators', () => {
  describe('isValidEntry', () => {
    it('유효한 엔트리는 true를 반환한다', () => {
      const validEntry = { id: 1, date: '2026-01-01', content: 'test content' };
      expect(isValidEntry(validEntry)).toBe(true);
    });

    it('id가 없으면 false를 반환한다', () => {
      const invalidEntry = { date: '2026-01-01', content: 'test' };
      expect(isValidEntry(invalidEntry)).toBe(false);
    });

    it('id가 숫자가 아니면 false를 반환한다', () => {
      const invalidEntry = { id: '1', date: '2026-01-01', content: 'test' };
      expect(isValidEntry(invalidEntry)).toBe(false);
    });

    it('date가 없으면 false를 반환한다', () => {
      const invalidEntry = { id: 1, content: 'test' };
      expect(isValidEntry(invalidEntry)).toBe(false);
    });

    it('content가 없으면 false를 반환한다', () => {
      const invalidEntry = { id: 1, date: '2026-01-01' };
      expect(isValidEntry(invalidEntry)).toBe(false);
    });

    it('null이면 false를 반환한다', () => {
      expect(isValidEntry(null)).toBe(false);
    });

    it('undefined면 false를 반환한다', () => {
      expect(isValidEntry(undefined)).toBe(false);
    });
  });
});
