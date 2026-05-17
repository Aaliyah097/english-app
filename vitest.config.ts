import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      // Worktrees used for parallel sub-agent work live under .claude/worktrees;
      // they each contain a full copy of src/ which would otherwise be scanned.
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '.claude/**',
      ],
    },
  }),
);
