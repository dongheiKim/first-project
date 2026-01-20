/**
 * 성능 모니터링 유틸리티
 */

/**
 * 페이지 로드 시간 측정
 */
export function measurePageLoad() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    console.log(`⏱️ 페이지 로드 시간: ${loadTime}ms`);
    
    if (loadTime > 3000) {
      console.warn('⚠️ 페이지 로드가 느립니다');
    }
  }
}

/**
 * 메모리 사용량 측정 (Chrome 전용)
 */
export function checkMemoryUsage() {
  if (performance.memory) {
    const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
    const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
    console.log(`💾 메모리: ${used}MB / ${limit}MB`);
  }
}

/**
 * 성능 마크 측정
 */
export function markPerformance(label) {
  if (performance.mark) {
    performance.mark(label);
  }
}

/**
 * 성능 측정 완료
 */
export function measurePerformance(label, startMark, endMark) {
  if (performance.measure) {
    performance.measure(label, startMark, endMark);
    const measure = performance.getEntriesByName(label)[0];
    console.log(`⏱️ ${label}: ${Math.round(measure.duration)}ms`);
  }
}
