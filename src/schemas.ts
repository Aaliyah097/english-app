// Zod schemas for every persisted entity and every AI-bound payload.
// Schemas are the source of truth; TS types are inferred in `types.ts`.
//
// v1 scope: no VocabularyCard, no vocabularyCardsToAdd. See docs/PLAN.md §7.

import { z } from 'zod';

export const levelSchema = z.enum([
  'beginner',
  'beginner_intermediate',
  'intermediate',
  'upper_intermediate',
]);

export const userProfileSchema = z.object({
  nativeLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  level: levelSchema,
  interests: z.array(z.string()),
  goal: z.string().min(1),
  preferredPracticeMode: z.literal('translation'),
});

export const mistakeSchema = z.object({
  type: z.string().min(1),
  example: z.string(),
  correction: z.string(),
  explanation: z.string().optional(),
});

export const exerciseSchema = z.object({
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  sentence: z.string(),
  grammarTopic: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
});

const currentLearningFocusSchema = z.object({
  grammarTopic: z.string().min(1),
  sentenceType: z.string().optional(),
  difficulty: z.number().int().min(1).max(5),
});

const currentTopicProgressSchema = z.object({
  topic: z.string().min(1),
  completedExercises: z.number().int().min(0),
  knownWeaknesses: z.array(z.string()),
});

export const learningCheckpointSchema = z.object({
  userProfile: userProfileSchema,
  currentLearningFocus: currentLearningFocusSchema,
  recentMistakes: z.array(mistakeSchema),
  completedTopics: z.array(z.string()),
  currentTopicProgress: currentTopicProgressSchema,
  lastCheckpointSummary: z.string(),
});

// Patch shape the AI returns in `updatedCheckpoint`. Both top-level keys AND
// the two nested objects are partial — the model commonly sends only the
// inner fields that changed. `mergeCheckpoint` in src/storage shallow-merges
// the nested objects against the stored checkpoint, then re-validates the
// whole thing against learningCheckpointSchema, so the strict invariant
// still holds after the merge.
export const partialLearningCheckpointSchema = z
  .object({
    userProfile: userProfileSchema,
    currentLearningFocus: currentLearningFocusSchema.partial(),
    recentMistakes: z.array(mistakeSchema),
    completedTopics: z.array(z.string()),
    currentTopicProgress: currentTopicProgressSchema.partial(),
    lastCheckpointSummary: z.string(),
  })
  .partial();

export const tutorResponseSchema = z.object({
  messageToUser: z.string().min(1),
  correctedAnswer: z.string().optional(),
  // Per-turn mistakes — what went wrong with THIS answer. Distinct from the
  // rolling LearningCheckpoint.recentMistakes log. Rendered as a bullet list
  // in the Practice review bubble. Empty array if the answer was perfect.
  mistakes: z.array(mistakeSchema).default([]),
  updatedCheckpoint: partialLearningCheckpointSchema,
  nextExercise: exerciseSchema,
});
