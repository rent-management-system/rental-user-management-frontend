import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isTest = mode === 'test';

  return {
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src')
        },
        {
          find: /^@\/(.*\.(j|t)sx?)$/,
          replacement: resolve(__dirname, 'src/$1')
        }
      ]
    },
    server: {
      port: 5173,
      open: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './jest.setup.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
