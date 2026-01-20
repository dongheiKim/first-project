/**
 * 테마 및 다크모드 관리
 */

export function getTheme() {
  const saved = localStorage.getItem('app_theme');
  if (saved) {
    return saved === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function setTheme(isDark) {
  localStorage.setItem('app_theme', isDark ? 'dark' : 'light');
  window.dispatchEvent(new Event('themechange'));
}
