import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback, useThrottledCallback, usePrevious } from '../usePerformance';

describe('usePerformance hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebouncedCallback', () => {
    it('debounce된 콜백을 반환한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 100));

      act(() => {
        result.current();
        result.current();
        result.current();
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('delay 이전에 다시 호출하면 타이머가 리셋된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 100));

      act(() => {
        result.current();
      });

      act(() => {
        vi.advanceTimersByTime(50);
        result.current();
      });

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('useThrottledCallback', () => {
    it('throttle된 콜백을 반환한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 100));

      act(() => {
        result.current();
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        result.current();
        result.current();
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('usePrevious', () => {
    it('이전 값을 반환한다', () => {
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 1 },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: 2 });
      expect(result.current).toBe(1);

      rerender({ value: 3 });
      expect(result.current).toBe(2);
    });
  });
});
