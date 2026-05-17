# S05 — App shell & screen routing

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 03
**Parallel with:** 06, 07, 10, 11
**Estimated size:** S

## 1. Goal
Wire the top-level `App` component so it owns screen state, decides whether to show onboarding (no profile yet) vs. the main app, and renders the active screen plus the bottom nav. Screens are mounted by id; each screen module owns its own data fetching from storage.

## 2. Context (read these first)
- Mockup `App` shape: [`ai/design/project/src/app.jsx`](../../ai/design/project/src/app.jsx) (whole file).
- Plan: [`docs/PLAN.md`](../PLAN.md) §5 — screen-routing contract.

## 3. Inputs you can rely on
- `BottomNav` and `ScreenId` from `src/ui` (S01).
- `getUserProfile`, `subscribe` from `src/storage` (S03).
- Stub screens are placeholder components shipped by S06/07/10/11.

## 4. Outputs you must produce
- `src/App.tsx` — the screen switcher. Decides between `OnboardingScreen` and the main app shell. Owns the active-screen state for the main app.
- `src/screens/index.ts` — barrel that re-exports each screen. Empty defaults are OK while sibling stories land; this file is the integration point.
- `src/screens/Placeholder.tsx` — a fallback rendered when a sibling screen hasn't shipped yet (renders the screen name on a warm bg so navigation can still be tested).

## 5. Task breakdown
1. Add a `ScreenId = 'practice' | 'progress' | 'settings'` (re-exported from `src/ui/BottomNav.tsx`).
2. `App.tsx`:
   - On mount and on every `subscribe` notification, read `getUserProfile()`.
   - If no profile → render `<OnboardingScreen onComplete={…} />`. `onComplete` is a no-op; S06 calls `setUserProfile` itself which triggers re-render via `subscribe`.
   - Otherwise → `useState<ScreenId>('practice')` and render the active screen + `<BottomNav>`.
3. Implement `useStorageSnapshot` consumption (from S03) — or use `useSyncExternalStore` against `subscribe` if cleaner.
4. Render the `<Practice|Progress|Settings>` component for the active screen. Import them from `src/screens/index.ts`. If a screen isn't shipped, fall back to `<Placeholder name="…" />`.
5. Smoke test in `src/App.test.tsx`:
   - With no profile in storage, the onboarding screen renders.
   - After a profile is written (call `setUserProfile`), the practice screen renders.
   - Clicking the "Progress" tab switches the active screen.

## 6. Files to create or modify
- `src/App.tsx` (replace S00's placeholder)
- `src/screens/index.ts`
- `src/screens/Placeholder.tsx`
- `src/App.test.tsx` (replace S00's smoke test)

## 7. Acceptance criteria
- No `localStorage` access in `App.tsx`; only via `src/storage`.
- `App` re-renders when storage notifies.
- All three tabs in `BottomNav` switch the active screen.
- Onboarding gating works end-to-end: clear storage → onboarding shown → write profile → main app shown.
- The three tests in §5.5 pass.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/App.test.tsx
```

## 9. Out of scope
- Screen content (owned by sibling stories).
- Deep links / URL routing.
- Page transitions, animations.

## 10. Notes / open questions
None.
