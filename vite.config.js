import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      // React 최적화
      babel: {
        plugins: [
          '@babel/plugin-syntax-import-meta',
        ],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      workbox: {
        // Service Worker 캐싱 전략
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apis\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-apis',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60, // 1일
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn-icons-png\.flaticon\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Minimal Diary 2026',
        short_name: '다이어리',
        description: 'React 기반 PWA 다이어리',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],

  // 빌드 최적화
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 청크 분할 전략
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'locales': ['./src/locales/index.ts'],
        },
      },
    },
    // 소스맵 비활성화 (프로덕션)
    sourcemap: false,
    // CSS 분리
    cssCodeSplit: true,
  },

  // 최적화 옵션
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  // 서버 설정
  server: {
    middlewareMode: false,
    headers: {
      'Cache-Control': 'public, max-age=31536000', // 1년 캐싱
    },
  },
});
