export const APP_TITLE = '2026 Diary';

export const ROUTES = {
  HOME: '/',
  WRITE: '/write',
  STATS: '/stats',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  ENTRIES: 'my_diary_v1',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
} as const;
