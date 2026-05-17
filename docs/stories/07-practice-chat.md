# S07 — Practice screen (chat variant)

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 02, 03, 04
**Parallel with:** 05, 06, 10, 11
**Estimated size:** L

## 1. Goal
Implement the canonical practice loop: AI shows a rule + sentence → user types translation → AI returns correction + next exercise → state persists. Visuals mirror `PracticeChat` from the mockup; data flow is live (S04), not canned.

> **Scope note:** vocabulary cards are out of MVP v1. **Skip** the mockup's `NewCardsRow` and "Saved to your deck" block entirely. Do not call any vocabulary storage method. The AI response no longer includes `vocabularyCardsToAdd`.

## 2. Context (read these first)
- Mockup: [`ai/design/project/src/practice.jsx`](../../ai/design/project/src/practice.jsx) — focus on `PracticeChat`, `Bubble`, `InlineDiff`, `TopicBar`, `ExerciseProgress`, `InputDock`. Ignore `PracticeCards`, `PracticeSplit`, and `NewCardsRow` (all out of MVP).
- Mockup data: [`ai/design/project/src/data.js`](../../ai/design/project/src/data.js) — `exercise.diff` token shape (`s: 'ok'|'wrong'|'fix'|'drop'|'add'`). Ignore the `newCards` field on the exercise object.
- Brief: "Main Practice Flow", "Correction UI Content", "AI Response Contract". Ignore bullets that mention vocabulary cards.
- Phase-0 contracts: S02 (types), S03 (storage), S04 (AI client).

## 3. Inputs you can rely on
- UI primitives (S01): `Bubble`, `InputDock`, `TypingDot`, `Chip`, `Btn`, `Icon`, `theme`.
- Storage (S03): `getCheckpoint`, `mergeCheckpoint`, `getUserProfile`.
- AI (S04): `requestTutorTurn`, `TutorTurnResult`.

## 4. Outputs you must produce
- `src/screens/practice/PracticeScreen.tsx` — top-level screen.
- `src/screens/practice/InlineDiff.tsx` — token-diff renderer (the AI **does not** return tokenised diffs; see §5 step 3).
- `src/screens/practice/TopicBar.tsx`, `ExerciseProgress.tsx` — ported from mockup.
- `src/screens/practice/useTutorTurn.ts` — small hook around `requestTutorTurn` that manages loading/error/result state.
- Re-export `PracticeScreen` from `src/screens/index.ts`.

## 5. Task breakdown
1. Compose the screen exactly as in `PracticeChat`: TopicBar → ExerciseProgress → scrolling stack of `Bubble`s → `InputDock`. Two phases: `'input'` (typing) and `'review'` (after AI response). **Do not** include the "Saved to your deck" bubble section from the mockup.
2. State held in the screen:
   - `currentExercise: Exercise` (initialised from checkpoint's `currentLearningFocus` — for first run, synthesise a default exercise based on the topic; AI generates real ones from turn 1 onwards).
   - `userAnswer: string`.
   - `phase: 'input' | 'awaiting' | 'review' | 'error'`.
   - `lastResult: TutorResponse | null` and `lastError: string | null`.
3. **Token diff is not in the AI contract.** The brief returns `correctedAnswer` as a plain string. Build a client-side diff helper that produces the mockup's token shape from `(userAnswer, correctedAnswer)` so we can keep the mockup's inline-diff visual. Use a small word-level LCS diff; one file, ~80 lines, fully tested. Keep it self-contained in `InlineDiff.tsx` or alongside it.
4. On submit:
   - Set `phase = 'awaiting'`. Show `<TypingDot />` in place of the correction bubble.
   - Build `TutorTurnInput` from current profile + checkpoint + current exercise + answer. (No vocabulary summary — that field does not exist in v1's `TutorTurnInput`.)
   - Call `requestTutorTurn`. Handle each tagged-union branch:
     - `ok` → `phase = 'review'`, persist via `mergeCheckpoint(response.updatedCheckpoint)`, save `response.nextExercise` to local state.
     - `no-key` → `phase = 'error'`, render an inline notice with a CTA "Add your API key in Settings".
     - `network-error` / `invalid-response` → `phase = 'error'`, render the error message + a Retry button.
5. "Next" CTA (in review phase): set `currentExercise = lastResult.nextExercise`, clear `userAnswer`, set `phase = 'input'`.
6. The cog icon in TopicBar opens Settings (uses S05's screen-change callback — pass it in as a prop).
7. Tests in `src/screens/practice/PracticeScreen.test.tsx`:
   - Renders input phase when no last result exists.
   - Submitting with a mocked `requestTutorTurn` returning `{ kind: 'ok', … }` advances to review and renders the corrected text.
   - Submitting with `{ kind: 'no-key' }` renders the API-key-missing notice.
   - "Next" after review goes back to input with cleared text and the new exercise as the source.
   - No "Saved to your deck" string ever appears in the rendered DOM (assert as a regression guard for the v1 scope).
8. Test the word-diff helper directly (4–6 cases incl. additions, drops, replacements, no-changes).

## 6. Files to create or modify
- All files listed in §4.
- `src/screens/practice/diff.ts` + `diff.test.ts` (or co-located with `InlineDiff`).
- `src/screens/index.ts` — re-export.

## 7. Acceptance criteria
- Visual parity with `PracticeChat` mockup **minus** the new-cards section.
- On reload, the most recent exercise + checkpoint are restored from storage.
- All four S04 result branches reachable from UI; user can always recover (retry, edit key).
- Submitting calls `requestTutorTurn` **once** per click.
- No imports from any vocabulary module; no string "Saved to your deck" / "+N cards saved" anywhere in the screen.
- No `window.*` globals; no direct `localStorage` reads.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/screens/practice
```

## 9. Out of scope
- Vocabulary extraction or card chips (out of MVP v1).
- `PracticeCards` and `PracticeSplit` variants.
- Streaming the response.
- Speech / mic input (mockup shows it as a deferred affordance).
- Lesson navigation beyond the current topic (the AI drives `nextExercise`).

## 10. Notes / open questions
- For the first-ever exercise (just after onboarding), synthesise an empty `Exercise` (`source: ''`, `grammarTopic: checkpoint.currentLearningFocus.grammarTopic`, `difficulty: 1`) and call the AI with `userAnswer: ''` to bootstrap the first turn. Alternatively, hard-code a seed sentence per starting topic. Pick the bootstrap-call approach unless it shows latency issues during dev.
