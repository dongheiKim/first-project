import { useEffect, useCallback, useRef } from 'react';
import { 
  announceToScreenReader, 
  createFocusTrap, 
  createKeyboardShortcuts, 
  KeyboardShortcut,
  prefersReducedMotion 
} from '../utils/a11y';

/**
 * 스크린 리더 알림 훅
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return announce;
}

/**
 * 포커스 트랩 훅 (모달용)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = createFocusTrap(containerRef.current);
    }

    return () => {
      cleanupRef.current?.();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * 키보드 단축키 훅
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || shortcuts.length === 0) return;

    const cleanup = createKeyboardShortcuts(shortcuts);
    return cleanup;
  }, [shortcuts, enabled]);
}

/**
 * Escape 키로 닫기 훅
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}

/**
 * 축소된 모션 선호도 훅
 */
export function useReducedMotion(): boolean {
  const prefersReduced = useRef(prefersReducedMotion());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReduced.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced.current;
}

/**
 * 포커스 복원 훅 (모달 닫을 때 이전 포커스로 복원)
 */
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
}
