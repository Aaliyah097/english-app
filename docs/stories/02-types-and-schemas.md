# S02 — Domain types & Zod schemas

**Phase:** 0 (foundation)
**Blocks:** 03, 04, 06, 07, 10, 11
**Depends on:** 00
**Parallel with:** 01, 03 (storage will import these but the API is defined here)
**Estimated size:** S

## 1. Goal
Define the canonical TypeScript types and matching Zod schemas for every persisted entity and every AI-bound payload. These types are the contract that every other story consumes; once merged, no other story may invent its own shape for these entities.

> **Scope note:** vocabulary cards are out of MVP v1. **Do not** define `vocabularyCardSchema` or include `vocabularyCardsToAdd` in `TutorResponse`. Reintroduce them only when the vocabulary feature is reopened.

## 2. Context (read these first)
- Brief: [`ai/claude_code_mvp_brief.md`](../../ai/claude_code_mvp_brief.md) sections "User Profile", "Checkpoint Model", "Exercise Model", "AI Response Contract".
- The brief uses string literal unions (`"beginner" | …`); preserve them verbatim.
- The brief's `TutorResponse` includes `vocabularyCardsToAdd`. **Skip that field** for v1 per the scope note.
- Mockup data shape sample: [`ai/design/project/src/data.js`](../../ai/design/project/src/data.js) — useful for the `exercise`, `mistakes`, and checkpoint shapes; ignore the `vocabulary` array.

## 3. Inputs you can rely on
- S00 scaffolding only.

## 4. Outputs you must produce
- `src/schemas.ts` — Zod schemas. One named export per entity.
- `src/types.ts` — pure TS types. **No runtime code.** Derive each type from the matching Zod schema using `z.infer<typeof X>`; do **not** maintain hand-written duplicates.

Exports required (names are frozen — other stories will import them by these names):

```ts
// schemas.ts
export const userProfileSchema = z.object({ … });
export const mistakeSchema = z.object({ … });
export const learningCheckpointSchema = z.object({ … });
export const exerciseSchema = z.object({ … });
export const tutorResponseSchema = z.object({ … });

// Partial-checkpoint schema used when AI returns updates
export const partialLearningCheckpointSchema = learningCheckpointSchema.partial();

// types.ts
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Mistake = z.infer<typeof mistakeSchema>;
export type LearningCheckpoint = z.infer<typeof learningCheckpointSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
```

`tutorResponseSchema` shape for v1:

```ts
{
  messageToUser: z.string(),
  correctedAnswer: z.string().optional(),
  updatedCheckpoint: partialLearningCheckpointSchema,
  nextExercise: exerciseSchema,
}
```

## 5. Task breakdown
1. Write `mistakeSchema`, `userProfileSchema`, `exerciseSchema` per brief.
2. Write `learningCheckpointSchema` — nested `currentLearningFocus`, `currentTopicProgress`, `recentMistakes` (array of `mistakeSchema`), `completedTopics` (string[]).
3. Write `tutorResponseSchema` per §4. Do not include `vocabularyCardsToAdd`.
4. Write `types.ts` as a thin `z.infer` wrapper file.
5. Unit tests in `src/schemas.test.ts`:
   - A valid `TutorResponse` parses (without `vocabularyCardsToAdd` — confirm it is rejected as an unknown key only if you set `.strict()`; default `z.object` allows it but doesn't infer it).
   - Missing `messageToUser` fails.
   - `partialLearningCheckpointSchema` accepts an empty object.
   - `userProfileSchema` rejects an unknown `level` value.

## 6. Files to create or modify
- `src/types.ts`
- `src/schemas.ts`
- `src/schemas.test.ts`

## 7. Acceptance criteria
- Every entity in §4 has a matching Zod schema and an inferred type.
- No `VocabularyCard` type, no vocab schema, no `vocabularyCardsToAdd` anywhere in the file.
- `types.ts` contains zero runtime code — pure type aliases.
- `npm run typecheck` passes.
- `npm run test` passes the schema test suite (≥4 cases).
- No story may add fields to these entities later without updating this story's schemas; downstream stories explicitly link back to this story for the contract.

## 8. Verification commands
```bash
npm run typecheck
npm run test -- --run src/schemas.test.ts
```

## 9. Out of scope
- Persistence/serialisation code (S03).
- Prompt construction (S04).
- Vocabulary cards in any form (out of MVP v1).

## 10. Notes / open questions
None.
