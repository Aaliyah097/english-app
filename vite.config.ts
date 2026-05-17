import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo-name>/. The repo name is read from
// the BASE_PATH env var so renaming the repo doesn't require a code change.
// Local dev defaults to '/'.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
});
