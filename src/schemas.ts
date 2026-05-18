// Zod schemas for every persisted entity and every AI-bound payload.
// Schemas are the source of truth; TS types are inferred in `types.ts`.

import { z } from 'zod';

export const userProfileSchema = z.object({
  // Language codes are short — capping to a sane length prevents a tampered
  // payload from stuffing the prompt with a giant "language code".
  nativeLanguage: z.string().min(1).max(10),
  targetLanguage: z.string().min(1).max(10),
  // ALL_INTERESTS lists 16 canonical entries; capping at 20 leaves room
  // for the user's onboarding choices without allowing prompt bloat. Per-item
  // length cap blocks the "single 250KB interest string" vector.
  interests: z.array(z.string().min(1).max(50)).max(20),
  preferredPracticeMode: z.literal('translation'),
});

export const mistakeSchema = z.object({
  type: z.string().min(1).max(100),
  example: z.string().max(200),
  correction: z.string().max(200),
  explanation: z.string().max(500).optional(),
});

export const exerciseSchema = z.object({
  sourceLanguage: z.string().min(1).max(10),
  targetLanguage: z.string().min(1).max(10),
  sentence: z.string().max(600),
  grammarTopic: z.string().min(1).max(100),
});

const currentLearningFocusSchema = z.object({
  grammarTopic: z.string().min(1).max(100),
  // One-sentence rule explanation for the current grammar topic. Maintained
  // by the AI: included when the topic changes (or when it's blank), omitted
  // on subsequent turns of the same topic. Defaults to '' so old checkpoints
  // without this field still parse.
  rule: z.string().max(500).default(''),
});

export const learningCheckpointSchema = z.object({
  userProfile: userProfileSchema,
  currentLearningFocus: currentLearningFocusSchema,
});

// Patch shape the AI returns in `updatedCheckpoint`. Top-level keys are
// optional and `currentLearningFocus` is itself partial — the model commonly
// sends only the inner fields that changed. `mergeCheckpoint` in src/storage
// shallow-merges the nested object against the stored checkpoint, then
// re-validates against learningCheckpointSchema so the strict invariant
// still holds after the merge.
export const partialLearningCheckpointSchema = z
  .object({
    userProfile: userProfileSchema,
    currentLearningFocus: currentLearningFocusSchema.partial(),
  })
  .partial();

export const tutorResponseSchema = z.object({
  messageToUser: z.string().min(1).max(1000),
  correctedAnswer: z.string().max(600).optional(),
  // Per-turn mistakes — what went wrong with THIS answer. Rendered as a
  // bullet list in the Practice review bubble. Empty array if the answer was
  // perfect. Capped at 10 — more than that suggests a malformed response.
  mistakes: z.array(mistakeSchema).max(10).default([]),
  updatedCheckpoint: partialLearningCheckpointSchema,
  nextExercise: exerciseSchema,
});
