/**
 * 무한 스크롤 커스텀 훅
 */
import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll(items, itemsPerPage = 20) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDisplayCount(itemsPerPage);
    setHasMore(items.length > itemsPerPage);
  }, [items.length, itemsPerPage]);

  const loadMore = useCallback(() => {
    const newCount = displayCount + itemsPerPage;
    setDisplayCount(newCount);
    setHasMore(items.length > newCount);
  }, [displayCount, items.length, itemsPerPage]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      hasMore
    ) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    displayedItems: items.slice(0, displayCount),
    hasMore,
    loadMore,
  };
}
