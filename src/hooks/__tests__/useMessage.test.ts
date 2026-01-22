import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessage } from '../useMessage';

describe('useMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('초기 상태는 null이다', () => {
    const { result } = renderHook(() => useMessage());
    expect(result.current.message).toBeNull();
  });

  it('showMessage로 메시지를 표시한다', () => {
    const { result } = renderHook(() => useMessage());

    act(() => {
      result.current.showMessage('success', '성공!');
    });

    expect(result.current.message).toEqual({ type: 'success', text: '성공!' });
  });

  it('showError로 에러 메시지를 표시한다', () => {
    const { result } = renderHook(() => useMessage());

    act(() => {
      result.current.showError('에러 발생!');
    });

    expect(result.current.message).toEqual({ type: 'error', text: '에러 발생!' });
  });

  it('showSuccess로 성공 메시지를 표시한다', () => {
    const { result } = renderHook(() => useMessage());

    act(() => {
      result.current.showSuccess('작업 완료!');
    });

    expect(result.current.message).toEqual({ type: 'success', text: '작업 완료!' });
  });

  it('지정된 시간 후 메시지가 사라진다', () => {
    const { result } = renderHook(() => useMessage({ timeout: 2000 }));

    act(() => {
      result.current.showMessage('info', '안내');
    });

    expect(result.current.message).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.message).toBeNull();
  });

  it('clearMessage로 즉시 메시지를 지운다', () => {
    const { result } = renderHook(() => useMessage());

    act(() => {
      result.current.showMessage('info', '테스트');
    });

    expect(result.current.message).not.toBeNull();

    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message).toBeNull();
  });
});
