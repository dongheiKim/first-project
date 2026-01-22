
import { describe, it, expect, vi } from 'vitest';
vi.mock('../workerManager');
import { compressWithWorker, decompressWithWorker } from '../backupUtils';

describe('backupUtils', () => {
  const entries = [
    { id: 1, date: '2026-01-01', content: 'hello' },
    { id: 2, date: '2026-01-02', content: 'world' },
  ];

  it('should compress and decompress with worker fallback', async () => {
    const compressed = await compressWithWorker(entries);
    expect(Array.isArray(compressed)).toBe(true);
    const restored = await decompressWithWorker(compressed);
    expect(restored).toStrictEqual(entries);
  });
});
