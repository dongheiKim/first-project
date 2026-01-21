/**
 * 모바일 유틸리티 함수
 */

/**
 * 햅틱 피드백 트리거 (지원 기기에서만)
 */
export function triggerHaptic(type = 'light') {
  if (navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 10, 10],
      error: [50, 25, 50],
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
}

/**
 * 모바일 여부 감지
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 터치 디바이스 여부 감지
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * PWA 설치 여부 확인
 */
export function isPWAInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * 온라인 상태 확인
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * 네트워크 속도 확인 (지원 기기에서만)
 */
export function getNetworkSpeed() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData, // 절약 모드 여부
    };
  }
  
  return null;
}

/**
 * 화면 방향 감지
 */
export function getOrientation() {
  return window.screen.orientation?.type || 
    (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
}

/**
 * 안전 영역 여부 확인 (노치가 있는 기기)
 */
export function hasSafeArea() {
  return CSS.supports('padding: env(safe-area-inset-bottom)');
}
