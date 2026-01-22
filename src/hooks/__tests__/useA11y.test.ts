import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnounce, useEscapeKey, useReducedMotion } from '../useA11y';

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

describe('useA11y hooks', () => {
  describe('useAnnounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      document.body.innerHTML = '';
    });

    it('스크린 리더 알림 요소를 생성한다', () => {
      const { result } = renderHook(() => useAnnounce());

      act(() => {
        result.current('테스트 메시지');
      });

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).not.toBeNull();
      expect(announcement?.textContent).toBe('테스트 메시지');
    });

    it('일정 시간 후 알림 요소가 제거된다', () => {
      const { result } = renderHook(() => useAnnounce());

      act(() => {
        result.current('테스트 메시지');
      });

      expect(document.querySelector('[role="status"]')).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(document.querySelector('[role="status"]')).toBeNull();
    });
  });

  describe('useEscapeKey', () => {
    it('Escape 키를 누르면 콜백이 호출된다', () => {
      const onEscape = vi.fn();
      renderHook(() => useEscapeKey(onEscape));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('enabled가 false면 콜백이 호출되지 않는다', () => {
      const onEscape = vi.fn();
      renderHook(() => useEscapeKey(onEscape, false));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onEscape).not.toHaveBeenCalled();
    });

    it('다른 키는 콜백을 호출하지 않는다', () => {
      const onEscape = vi.fn();
      renderHook(() => useEscapeKey(onEscape));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  describe('useReducedMotion', () => {
    it('축소된 모션 선호도를 반환한다', () => {
      const { result } = renderHook(() => useReducedMotion());
      expect(typeof result.current).toBe('boolean');
    });
  });
});
