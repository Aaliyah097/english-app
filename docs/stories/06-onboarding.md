# S06 — Onboarding flow (5 steps)

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 02, 03
**Parallel with:** 05, 07, 08, 10, 11
**Estimated size:** M

## 1. Goal
Implement the 5-step onboarding flow exactly as in the mockup. On completion, persist a `UserProfile` and an initial `LearningCheckpoint` so the main app can take over without an empty-state edge case.

## 2. Context (read these first)
- Mockup: [`ai/design/project/src/onboarding.jsx`](../../ai/design/project/src/onboarding.jsx) — read top-to-bottom. Five step components: `StepWelcome`, `StepLanguages`, `StepLevel`, `StepInterests`, `StepGoal`.
- Brief: "User Profile", "Learning Path", "Checkpoint Model".
- Onboarding is gated by S05: `App.tsx` renders it when `getUserProfile()` returns `null`.

## 3. Inputs you can rely on
- UI primitives (S01): `Btn`, `Chip`, `Icon`, `theme`.
- Types/schemas (S02): `UserProfile`, `LearningCheckpoint`.
- Storage (S03): `setUserProfile`, `setCheckpoint`.

## 4. Outputs you must produce
- `src/screens/onboarding/OnboardingScreen.tsx` — top-level wrapper handling step state.
- `src/screens/onboarding/StepWelcome.tsx`
- `src/screens/onboarding/StepLanguages.tsx`
- `src/screens/onboarding/StepLevel.tsx`
- `src/screens/onboarding/StepInterests.tsx`
- `src/screens/onboarding/StepGoal.tsx`
- Re-export `OnboardingScreen` from `src/screens/index.ts`.

`OnboardingScreen` signature: `(props: { onComplete?: () => void }) => JSX.Element`. The component itself writes profile + checkpoint to storage before calling `onComplete`.

## 5. Task breakdown
1. Port `OnboardingScreen` shell (top progress dots, back button, content slot, primary CTA). Use `useState` for `step` and a draft `Partial<UserProfile>`.
2. Port each step pixel-for-pixel from the mockup. Translate JS shapes to typed React props.
3. Map mockup state ↔ schema names:
   - `state.native` → `UserProfile.nativeLanguage`
   - `state.level` (`'beginner' | 'intermediate' | 'upper' | 'advanced'`) → schema's `level` enum. The mockup has `'upper'` and `'advanced'` whereas the schema (per brief) has `'beginner_intermediate' | 'intermediate' | 'upper_intermediate'` and no `'advanced'`. Align to the **schema**; rename mockup ids accordingly (`upper` → `upper_intermediate`, drop `advanced` or map it to `upper_intermediate`).
   - `state.interests` → `UserProfile.interests` (already string[]).
   - `state.goal` → `UserProfile.goal` (string; use the option's label, not the id).
   - `targetLanguage = 'en'` (locked in v0.1, per `StepLanguages`).
   - `preferredPracticeMode = 'translation'`.
4. On final-step "Start practising":
   - Build the full `UserProfile`, run it through `userProfileSchema.parse` (defensive).
   - Build an initial `LearningCheckpoint`:
     - `currentLearningFocus = { grammarTopic: 'Present Simple', difficulty: 2 }`
     - `recentMistakes = []`
     - `completedTopics = []`
     - `currentTopicProgress = { topic: 'Present Simple', completedExercises: 0, knownWeaknesses: [] }`
     - `lastCheckpointSummary = ''`
   - `setUserProfile(profile); setCheckpoint(checkpoint); onComplete?.();`
5. Tests in `src/screens/onboarding/OnboardingScreen.test.tsx`:
   - Renders the welcome step on mount.
   - "Begin" advances to languages step.
   - Selecting language → level → interests (default) → goal (default) → "Start practising" writes a valid profile + checkpoint to storage.

## 6. Files to create or modify
- The six files listed in §4.
- `src/screens/index.ts` — re-export.
- One test file.

## 7. Acceptance criteria
- All five steps render and advance as in the mockup.
- "Back" works on steps 2–5 and is hidden on step 1.
- Step indicator dots match the mockup behaviour.
- Final CTA writes a profile **and** a checkpoint that pass their respective Zod schemas (assert in test).
- After completion, `App` (via S05's gating) shows the main app.
- No `localStorage` reads/writes outside `src/storage`.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/screens/onboarding
```

## 9. Out of scope
- Editing onboarding answers later (Settings handles edits — S11).
- Animations beyond the existing `transition: all .25s` on the step indicator.
- Skipping onboarding via a query string.

## 10. Notes / open questions
- The mockup's `'advanced'` level is not in the brief's schema. The schema is authoritative; this story drops `'advanced'` and leaves four options that map to schema levels: `beginner`, `beginner_intermediate` (was "Beginner-Intermediate" wording — copy preserved), `intermediate`, `upper_intermediate`.
