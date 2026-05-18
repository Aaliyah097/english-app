# Englishly

Local-first AI language tutor for Russian-speaking software professionals. Translate workplace sentences from Russian into English, Spanish, or Italian; get short, grammar-focused corrections. Progress stays on-device in `localStorage`. Backed by DeepSeek via a Next.js route handler that holds the API key server-side.

## Running locally

Requires Node 20 or newer (Next 16 requirement).

```bash
nvm use            # Node 20 (see .nvmrc)
npm install

# Copy the env template and fill in your key:
cp .env.example .env.local
# then edit .env.local — set DEEPSEEK_API_KEY=sk-...

# Full stack — Next.js dev server + /api routes in-process:
npm run dev        # http://localhost:3000

# Verifications:
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run dev` runs `next dev`, which serves the app and all `/api/*` route handlers from one process. No `vercel dev`, no separate API server.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js.
3. **Project → Settings → Environment Variables → Add** `DEEPSEEK_API_KEY` (required). Optional: `DEEPSEEK_MODEL` (defaults to `deepseek-chat`), `DEEPSEEK_BASE_URL` (defaults to `https://api.deepseek.com/v1`).
4. Push to `main`. Vercel builds and deploys automatically; pages are statically rendered and `/api/tutor` runs as a serverless function.

The static bundle never contains the DeepSeek key — it lives in the route handler's environment.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs typecheck, lint, tests, and build on push/PR to `main`. It does not deploy — Vercel's GitHub integration handles deploys.
