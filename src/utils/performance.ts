export function measurePerformance(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}
