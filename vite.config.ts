import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiDevPlugin } from './src/dev/apiPlugin';

// Vercel serves the static SPA from the root, so the default base is '/'.
// BASE_PATH is kept as an escape hatch for other static hosts.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react(), apiDevPlugin()],
});
