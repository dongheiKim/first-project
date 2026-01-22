import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  announceToScreenReader, 
  hasGoodContrast, 
  prefersReducedMotion,
  createKeyboardShortcuts
} from '../a11y';

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('a11y utils', () => {
  describe('announceToScreenReader', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      document.body.innerHTML = '';
    });

    it('role=status 요소를 생성한다', () => {
      announceToScreenReader('테스트');

      const element = document.querySelector('[role="status"]');
      expect(element).not.toBeNull();
      expect(element?.getAttribute('aria-live')).toBe('polite');
    });

    it('assertive 우선순위를 지원한다', () => {
      announceToScreenReader('긴급 메시지', 'assertive');

      const element = document.querySelector('[role="status"]');
      expect(element?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('hasGoodContrast', () => {
    it('검정/흰색은 좋은 대비를 갖는다', () => {
      expect(hasGoodContrast('#000000', '#ffffff')).toBe(true);
    });

    it('비슷한 색은 나쁜 대비를 갖는다', () => {
      expect(hasGoodContrast('#cccccc', '#dddddd')).toBe(false);
    });

    it('큰 텍스트는 더 낮은 대비 비율을 허용한다', () => {
      // 3:1 이상이지만 4.5:1 미만인 케이스
      const result = hasGoodContrast('#767676', '#ffffff', true);
      expect(result).toBe(true);
    });
  });

  describe('prefersReducedMotion', () => {
    it('boolean을 반환한다', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createKeyboardShortcuts', () => {
    it('단축키 핸들러를 등록하고 클린업 함수를 반환한다', () => {
      const action = vi.fn();
      const shortcuts = [{ key: 's', ctrl: true, action, description: 'Save' }];

      const cleanup = createKeyboardShortcuts(shortcuts);

      // Ctrl+S 이벤트 발생
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true 
      });
      document.dispatchEvent(event);

      expect(action).toHaveBeenCalled();

      // 클린업 후에는 호출되지 않음
      cleanup();
      action.mockClear();
      document.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
    });
  });
});
