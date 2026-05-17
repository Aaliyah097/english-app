# S00 — Project scaffolding & CI

**Phase:** 0 (foundation)
**Blocks:** all other stories
**Depends on:** —
**Parallel with:** —
**Estimated size:** S

## 1. Goal
Stand up a Vite + React + TypeScript project that builds, lints, tests on push/PR. No product code beyond a "hello" route that renders the warm off-white background — just enough to prove the pipeline works end-to-end. Deploys are handled by Vercel via its GitHub integration (no deploy step in the workflow).

## 2. Context (read these first)
- Plan: [`docs/PLAN.md`](../PLAN.md) §2 (Tech stack) and §1 (why Vercel + serverless function instead of BYOK).
- Existing repo state: `.git/`, `.gitignore`, `ai/` (spec + design bundle). The repo is empty of code.
- Note: `base` in `vite.config.ts` must equal `/<repo-name>/` for GH Pages sub-path serving.

## 3. Inputs you can rely on
None — this is the root.

## 4. Outputs you must produce
- A working `npm run dev` / `npm run build` / `npm run preview`.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`.
- Deployed site reachable at `https://<owner>.github.io/<repo>/`.
- `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- ESLint flat config + Prettier config wired into `lint`.
- Vitest configured (jsdom env) with one passing smoke test.

## 5. Task breakdown
1. `npm create vite@latest . -- --template react-ts` (in an empty subdir, then move files in — or scaffold manually if cleaner with existing `ai/` and `.gitignore`).
2. Pin Node version via `.nvmrc` (`20`).
3. Add dependencies: `react`, `react-dom`, `zod`, `openai` (used only server-side in `api/tutor.ts` against DeepSeek's OpenAI-compatible endpoint — see S04).
4. Add devDependencies: `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `prettier`.
5. Configure `tsconfig.json` (strict) and `tsconfig.node.json`.
6. Configure `vite.config.ts` with `base: '/<repo-name>/'` read from `process.env.BASE_PATH` or hard-coded — pick the repo name from `git remote get-url origin` and document the choice in a comment.
7. Configure `vitest.config.ts` (extends `vite.config.ts`, `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`).
8. Write `src/test/setup.ts` importing `@testing-library/jest-dom`.
9. ESLint flat config with TS + react-hooks rules; `npm run lint` must pass.
10. Write `index.html` rendering `<div id="root">` and loading `src/main.tsx`.
11. Write `src/main.tsx` and `src/App.tsx` (App renders the warm bg `#faf9f6` full-screen with the text "Englishly · v0.1" — just enough to verify the build).
12. Write `src/App.test.tsx` — one render-smoke test.
13. Add `.github/workflows/ci.yml` that on push/PR to `main`: install, typecheck, lint, test, build. Vercel handles the actual deploy via its GitHub integration — no deploy step in CI.
14. Add a README pointing to `docs/PLAN.md`.

## 6. Files to create or modify
- `package.json`, `package-lock.json`
- `tsconfig.json`, `tsconfig.node.json`
- `vite.config.ts`, `vitest.config.ts`
- `eslint.config.js`, `.prettierrc`
- `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/test/setup.ts`
- `.github/workflows/ci.yml`
- `.gitignore` (extend; do not overwrite the existing one)
- `.nvmrc`
- `README.md`

## 7. Acceptance criteria
- `npm install && npm run typecheck && npm run lint && npm run test && npm run build` passes on a clean clone.
- `npm run dev` serves the page locally with the warm off-white background.
- Pushing to `main` triggers the CI workflow (typecheck/lint/test/build); Vercel deploys the same commit via its own GitHub integration.
- `vite.config.ts` `base` is parameterised or commented so the repo can be renamed without breaking the build.
- No story-1+ code (no theme module, no domain types, no screens beyond placeholder).

## 8. Verification commands
```bash
npm install
npm run typecheck
npm run lint
npm run test -- --run
npm run build
# Then push to a test branch and watch the CI workflow succeed,
# or rely on the user merging to main.
```

## 9. Out of scope
- Theme module, icons, domain types, storage, AI client — those are S01–S04.
- Routing libraries (`react-router-dom`). MVP uses in-memory state.
- Tailwind / CSS-in-JS libraries.
- Service worker / PWA shell.

## 10. Notes / open questions
- Vercel must be connected to the GitHub repo (one-time, via the Vercel dashboard) and `DEEPSEEK_API_KEY` set as a project env var. Flag this in the README.
