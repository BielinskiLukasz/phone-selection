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
    env: { VITE_QUIZ_ADVANCE_MS: '10' },
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
    /*
     * Testy przepływów renderują cały App w jsdom (karty, pełny ranking z 15 wierszami, historia) i czekają na
     * debounce zapisu (300 ms). Najdłuższy („2., 7. i 8.” w tests/exclusions.test.ts) zajmuje 4-6 s zależnie od
     * maszyny, więc domyślne 5 s dawało losowe timeouty. 20 s to zapas, a nie zachęta do wolnych testów.
     */
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
