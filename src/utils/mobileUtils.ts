export function isMobile(): boolean {
  return /Mobi|Android/i.test(navigator.userAgent);
}

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * 햅틱 피드백 트리거 (지원되는 경우)
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if ('vibrate' in navigator) {
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [10, 50, 10],
      warning: [25, 50, 25],
      error: [50, 25, 50, 25, 50],
    };
    navigator.vibrate(patterns[type]);
  }
}
