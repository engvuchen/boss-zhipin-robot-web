import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { rm } from 'node:fs/promises';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'Cleaning assets folder',
      async buildStart() {
        if (process.env.NODE_ENV === 'production') {
          await rm(resolve(__dirname, '../dist/assets'), { recursive: true, force: true });
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // base: '/dist', // 也可以是 Koa2 自定义逻辑
  build: {
    outDir: '../dist',
  },
});
