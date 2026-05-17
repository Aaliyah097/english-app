# Englishly

Local-first AI English tutor. Translate sentences from your native language, get short corrections, save progress on-device. Backed by DeepSeek via a Vercel serverless function that holds the API key server-side.

See **[`docs/PLAN.md`](docs/PLAN.md)** for the development plan and **[`docs/stories/`](docs/stories/)** for the per-story implementation briefs.

## Running locally

```bash
nvm use            # Node 20 (see .nvmrc)
npm install

# Create .env.local in the project root:
#   DEEPSEEK_API_KEY=sk-...
# (Optional: DEEPSEEK_MODEL=deepseek-chat)

# Full stack — Vite dev server + /api/tutor handler in-process:
npm run dev        # http://localhost:5173

# Verifications:
npm run typecheck
npm run lint
npm run test
npm run build && npm run preview
```

`npm run dev` mounts the same `api/tutor.ts` handler used in production via a small dev-only Vite plugin (see [`src/dev/apiPlugin.ts`](src/dev/apiPlugin.ts)). No `vercel dev`, no separate Node server — one command for the whole stack.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Vite.
3. **Project → Settings → Environment Variables → Add** `DEEPSEEK_API_KEY` (and optionally `DEEPSEEK_MODEL`, defaults to `deepseek-chat`).
4. Push to `main`. Vercel builds and deploys automatically; the frontend is served as a static SPA and `/api/tutor` runs as a serverless function.

The static bundle never contains the DeepSeek key — it lives in the serverless function's environment.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs typecheck, lint, tests, and build on push/PR to `main`. It does not deploy — Vercel's GitHub integration handles deploys.
