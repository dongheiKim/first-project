import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// compression mock
vi.mock('../../utils/compression', () => ({
  compressData: vi.fn((data) => data.map((item: any) => ({ i: item.id, d: item.date, c: item.content }))),
  decompressData: vi.fn((data) => data.map((item: any) => ({ id: item.i, date: item.d, content: item.c }))),
}));

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('초기값을 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('localStorage에 저장된 값을 반환한다', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored value');
  });

  it('setValue로 값을 업데이트한다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
  });

  it('배열 데이터를 압축하여 저장한다', () => {
    const entries = [
      { id: 1, date: '2026-01-01', content: 'test' },
    ];
    
    const { result } = renderHook(() => useLocalStorage('diary-entries', []));
    
    act(() => {
      result.current[1](entries);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('함수형 업데이트를 지원한다', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });
});
