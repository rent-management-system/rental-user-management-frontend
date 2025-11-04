/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://rent-managment-system-user-magt.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
