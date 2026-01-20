/**
 * 앱 전역 상수
 */

export const STORAGE_KEYS = {
  ENTRIES: 'my_diary_v1',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
};

export const ROUTES = {
  HOME: '/',
  WRITE: '/write',
  STATS: '/stats',
  SETTINGS: '/settings',
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_COUNT: 5,
  COMPRESS_SIZE: 1200,
  COMPRESS_QUALITY: 0.85,
  THUMBNAIL_SIZE: 150,
  THUMBNAIL_QUALITY: 0.7,
};

export const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
