import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { compressData, calculateDataSize } from '../utils/compression';
import { useTranslation } from '../locales';

/**
 * 저장소 통계 컴포넌트
 */
export function StorageStats() {
  const { entries } = useApp();
  const t = useTranslation();

  const stats = useMemo(() => {
    // 원본 크기
    const originalSize = calculateDataSize(entries);
    
    // 압축된 크기
    const compressed = compressData(entries);
    const compressedSize = calculateDataSize(compressed);
    
    // 압축률
    const ratio = originalSize.bytes > 0
      ? ((1 - compressedSize.bytes / originalSize.bytes) * 100).toFixed(1)
      : 0;
    
    return {
      original: originalSize.kb,
      compressed: compressedSize.kb,
      saved: (originalSize.bytes - compressedSize.bytes) / 1024,
      ratio: ratio
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="storage-stats">
      <h4>💾 {t.storageStats || '저장소 통계'}</h4>
      <div className="stats-row">
        <span>{t.originalSize || '원본'}:</span>
        <span>{stats.original} KB</span>
      </div>
      <div className="stats-row">
        <span>{t.compressedSize || '압축'}:</span>
        <span className="compressed">{stats.compressed} KB</span>
      </div>
      <div className="stats-row">
        <span>{t.savedSize || '절약'}:</span>
        <span className="saved">{stats.saved.toFixed(2)} KB</span>
      </div>
      <div className="stats-row highlight">
        <span>{t.compressionRatio || '압축률'}:</span>
        <span>{stats.ratio}% ⬇️</span>
      </div>
    </div>
  );
}
