import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Standalone vitest config — no longer extends vite.config (the project
// uses Next.js for build/dev; vitest still uses Vite internally for test
// transforms, hence the React plugin).

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '.claude/**'],
  },
});
