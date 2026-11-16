import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Konfiguracja testów (E1-06). Trzymana osobno, żeby nie ruszać `vite.config.ts`
 * używanego przez build.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(dir, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15_000,
    env: { VITE_QUIZ_ADVANCE_MS: '10' },
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
