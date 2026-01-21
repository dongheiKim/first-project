/**
 * Pull-to-Refresh 커스텀 훅
 */
import { useState, useEffect, useRef } from 'react';

export function usePullToRefresh(onRefresh, threshold = 80) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY.current) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        setPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold) {
      await onRefresh();
    }
    setPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  return {
    pulling,
    pullDistance,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
