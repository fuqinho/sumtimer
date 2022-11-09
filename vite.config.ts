/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar-variables.sass',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
