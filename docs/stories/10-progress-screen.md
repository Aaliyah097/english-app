# S10 — Progress screen

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 02, 03
**Parallel with:** 05, 06, 07, 11
**Estimated size:** S

## 1. Goal
Render a lightweight read-only view of the user's progress: current grammar topic, exercises completed, completed topics, top recent mistakes. No analytics, no charts beyond the simple progress bar already in the design system.

> **Scope note:** vocabulary cards are out of MVP v1. **Skip** the vocabulary-count card from the mockup. Do not import anything from a vocabulary module.

## 2. Context (read these first)
- Mockup: [`ai/design/project/src/screens.jsx`](../../ai/design/project/src/screens.jsx) — find `ProgressScreen`.
- Brief: "Progress Screen", "Learning Path".
- Data sources are local only (storage). Do **not** call the AI.

## 3. Inputs you can rely on
- UI primitives (S01).
- Storage (S03): `getCheckpoint`, `subscribe`.

## 4. Outputs you must produce
- `src/screens/progress/ProgressScreen.tsx`
- `src/screens/progress/grammarPath.ts` — the static grammar path list (from brief) plus a helper that, given `checkpoint.completedTopics` and `currentLearningFocus.grammarTopic`, returns each topic tagged with `state: 'completed' | 'current' | 'upcoming' | 'locked'`.
- Re-export from `src/screens/index.ts`.

## 5. Task breakdown
1. Port the mockup's `ProgressScreen` layout (header strip, "current focus" card, exercises completed, recent mistakes list, grammar path with state pills). **Omit the vocabulary count card** from the mockup.
2. Reactive read of checkpoint via `useSyncExternalStore`.
3. `grammarPath.ts`: declare the 13-item brief list as a `const` array. Helper: tag the first non-completed item as `'current'` if it matches `currentLearningFocus.grammarTopic`, else `'upcoming'`. Items past it are `'locked'`.
4. Empty checkpoint case: render a friendly empty card "Start practising to see your progress." with a CTA prop `onGoToPractice` (S05 wires it).
5. Tests:
   - Renders the current topic from a seeded checkpoint.
   - `grammarPath` helper tags topics correctly for a representative checkpoint.
   - Renders the empty state when storage is bare.

## 6. Files to create or modify
- The two files in §4.
- `src/screens/progress/ProgressScreen.test.tsx`
- `src/screens/progress/grammarPath.test.ts`
- `src/screens/index.ts` re-export.

## 7. Acceptance criteria
- Visual parity with `ProgressScreen` mockup, minus the vocabulary count card.
- No imports from any vocabulary module (asserted by file inspection).
- Pure local data, no AI calls.
- All three tests pass.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/screens/progress
```

## 9. Out of scope
- Time-series charts, streak heatmaps.
- Editing topics (Settings).
- Resetting individual topics.

## 10. Notes / open questions
None.
