import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
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
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
