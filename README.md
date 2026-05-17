# Englishly

Local-first AI English tutor. Translate sentences from your native language, get short corrections, save progress on-device. Powered by DeepSeek via BYOK (you bring your own API key).

See **[`docs/PLAN.md`](docs/PLAN.md)** for the development plan and **[`docs/stories/`](docs/stories/)** for the per-story implementation briefs.

## Running locally

```bash
nvm use            # Node 20 (see .nvmrc); Node 18.19+ also works locally
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm run test
npm run build && npm run preview
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Source: GitHub Actions** (one-time toggle).
3. Push to `main`. The workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds, runs tests, and publishes.

`vite.config.ts` reads the sub-path from the `BASE_PATH` env var; the workflow sets it to `/<repo-name>/` automatically.
