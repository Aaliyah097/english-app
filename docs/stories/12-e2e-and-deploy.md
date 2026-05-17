# S12 — End-to-end smoke test & deploy

**Phase:** 2 (ship)
**Blocks:** —
**Depends on:** 00, 01, 02, 03, 04, 05, 06, 07, 10, 11
**Parallel with:** —
**Estimated size:** S

## 1. Goal
Verify the full happy path in a real browser, fix any integration gaps that Phase 1 stories left at their seams, and confirm the Vercel deploy (frontend + `/api/tutor` serverless function) serves the production app correctly.

## 2. Context (read these first)
- All Phase 1 story acceptance criteria.
- Plan: [`docs/PLAN.md`](../PLAN.md) §6 (whole-MVP acceptance checklist).
- Workflow: `.github/workflows/ci.yml` from S00.

## 3. Inputs you can rely on
Every shipped Phase 1 module.

## 4. Outputs you must produce
- One end-to-end smoke test in `e2e/smoke.spec.ts` using **Playwright** (add as the only new devDependency). The test runs against `npm run preview` and walks:
  1. Cold start → onboarding renders.
  2. Complete 5-step onboarding with defaults.
  3. Land on Practice. Use a mocked AI response (intercepted via `page.route` against `/api/tutor`) returning a canned `TutorResponse` JSON payload directly (Vercel function shape).
  4. Submit a translation → review phase shows correction.
  5. Click Progress → current topic from the checkpoint is visible.
  6. Click Settings → export downloads a JSON file containing the profile.
  7. Reset → returns to onboarding.
  8. Assert: the rendered DOM never contains the words "Vocabulary", "Saved to your deck", or "+N cards saved" (regression guard for the v1 scope).
- A README section: "Running locally" + "Deploying to Vercel" (enable Pages, set repo name in `vite.config.ts`).
- Whatever cross-story fixes the smoke test uncovers (each as its own commit, scoped to a single story's area).

## 5. Task breakdown
1. Install Playwright + browser binaries (`npx playwright install --with-deps chromium`). Add `playwright.config.ts` (uses `webServer` to run `npm run preview` on a random port).
2. Write the smoke test in §4.
3. Wire the test into CI: a new job in `.github/workflows/ci.yml` that runs before the deploy step (`needs:` dependency). The deploy step only runs if the smoke test passes.
4. Manual checklist run (document in a PR description, not a file):
   - Visit the deployed URL.
   - Walk through with a real DeepSeek key (developer's own).
   - Confirm: practice turn returns; checkpoint advances; export+reimport restores state.
5. Fix any integration gaps found. Keep each fix scoped to the originating story's folder.
6. Update `docs/PLAN.md` §6 — tick each box, link to the smoke test for the corresponding criterion.

## 6. Files to create or modify
- `e2e/smoke.spec.ts`
- `playwright.config.ts`
- `package.json` (add `playwright` devDep + `test:e2e` script)
- `.github/workflows/ci.yml` (extend with the e2e job)
- `README.md` (deployment + local-dev sections)
- `docs/PLAN.md` (tick the acceptance checklist)
- Any small fix files in `src/...` from §5 step 5.

## 7. Acceptance criteria
- `npm run test:e2e` passes locally and in CI against the production build.
- Vercel deploy succeeds on push to `main`.
- The deployed site walks through the smoke-test scenario end-to-end in a real browser with a real API key (manual check).
- All items in `docs/PLAN.md` §6 are ticked with links to the verifying test or story.

## 8. Verification commands
```bash
npm run build
npm run test:e2e
# Push to main, watch the workflow succeed, visit the published URL.
```

## 9. Out of scope
- Visual regression tests.
- Performance budgets / Lighthouse.
- Cypress / a second test framework.
- Multi-browser e2e (Chromium only for MVP).
- Post-MVP screens (cards/split practice variants).

## 10. Notes / open questions
None.
