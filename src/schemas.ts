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

export const learningCheckpointSchema = z.object({
  userProfile: userProfileSchema,
  currentLearningFocus: z.object({
    grammarTopic: z.string().min(1),
    sentenceType: z.string().optional(),
    difficulty: z.number().int().min(1).max(5),
  }),
  recentMistakes: z.array(mistakeSchema),
  completedTopics: z.array(z.string()),
  currentTopicProgress: z.object({
    topic: z.string().min(1),
    completedExercises: z.number().int().min(0),
    knownWeaknesses: z.array(z.string()),
  }),
  lastCheckpointSummary: z.string(),
});

export const partialLearningCheckpointSchema = learningCheckpointSchema.partial();

export const tutorResponseSchema = z.object({
  messageToUser: z.string().min(1),
  correctedAnswer: z.string().optional(),
  updatedCheckpoint: partialLearningCheckpointSchema,
  nextExercise: exerciseSchema,
});
