import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoading } from '../useLoading';

describe('useLoading', () => {
  it('초기 상태는 false이다', () => {
    const { result } = renderHook(() => useLoading());
    expect(result.current.isLoading).toBe(false);
  });

  it('초기 상태를 설정할 수 있다', () => {
    const { result } = renderHook(() => useLoading(true));
    expect(result.current.isLoading).toBe(true);
  });

  it('startLoading으로 로딩을 시작한다', () => {
    const { result } = renderHook(() => useLoading());

    act(() => {
      result.current.startLoading();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('stopLoading으로 로딩을 종료한다', () => {
    const { result } = renderHook(() => useLoading(true));

    act(() => {
      result.current.stopLoading();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('withLoading은 비동기 함수 실행 중 로딩 상태를 관리한다', async () => {
    const { result } = renderHook(() => useLoading());
    const asyncFn = vi.fn().mockResolvedValue('result');

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.withLoading(asyncFn);
    });

    expect(asyncFn).toHaveBeenCalled();
    expect(returnValue).toBe('result');
    expect(result.current.isLoading).toBe(false);
  });

  it('withLoading은 에러 발생 시에도 로딩을 종료한다', async () => {
    const { result } = renderHook(() => useLoading());
    const asyncFn = vi.fn().mockRejectedValue(new Error('test error'));

    await act(async () => {
      try {
        await result.current.withLoading(asyncFn);
      } catch {
        // expected
      }
    });

    expect(result.current.isLoading).toBe(false);
  });
});
