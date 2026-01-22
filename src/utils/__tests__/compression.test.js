import { compress, decompress } from '../compression';
import { describe, it, expect } from 'vitest';

describe('compression utils', () => {
  const entries = [
    { id: 1, date: '2026-01-01', content: 'hello' },
    { id: 2, date: '2026-01-02', content: 'world' },
  ];

  it('should compress and decompress data correctly', () => {
    const compressed = compress(entries);
    expect(Array.isArray(compressed)).toBe(true);
    expect(compressed[0]).toHaveProperty('i');
    const restored = decompress(compressed);
    expect(restored).toStrictEqual(entries);
  });

  it('should handle empty array', () => {
    expect(compress([])).toStrictEqual([]);
    expect(decompress([])).toStrictEqual([]);
  });
});
