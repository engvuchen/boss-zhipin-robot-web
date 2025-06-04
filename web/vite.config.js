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
                    await rm(resolve(__dirname, '../dist/assets'), {
                        recursive: true,
                        force: true,
                    });
                }
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
        // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    define: {
        'import.meta.env.BOSS_IP': JSON.stringify(process.env.BOSS_IP),
        'import.meta.env.BOSS_PORT': JSON.stringify(process.env.BOSS_PORT),
    },
    build: {
        outDir: '../dist',
    },
});
