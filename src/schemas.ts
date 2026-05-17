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

// Closed list of error categories the model picks from when tagging a mistake.
// Used for grouping/aggregation so two slightly-different free-text `type`
// strings ("Third-person -s rule" vs "Third-person singular -s") collapse into
// the same bucket. Anything that doesn't fit cleanly is `other`.
export const ERROR_CATEGORIES = [
  'third_person_s',
  'articles',
  'prepositions',
  'tense_choice',
  'tense_form',
  'word_order',
  'agreement',
  'pronoun',
  'vocabulary_choice',
  'collocation',
  'spelling',
  'other',
] as const;

export const errorCategorySchema = z.enum(ERROR_CATEGORIES);
export type ErrorCategory = z.infer<typeof errorCategorySchema>;

export const mistakeSchema = z.object({
  type: z.string().min(1),
  // `category` should always be set by the AI per the prompt, but defaulting
  // to 'other' keeps us resilient: (a) old stored mistakes from before this
  // field was added still parse, (b) if the model slips and omits it for a
  // new mistake we accept the response rather than 502ing.
  category: errorCategorySchema.default('other'),
  example: z.string(),
  correction: z.string(),
  explanation: z.string().optional(),
});

// Per-checkpoint lifetime counts: number of turns each category has been
// flagged in. Owned by the client (not the AI) — see src/storage/index.ts
// `bumpMistakeCategories`.
export const mistakesByCategorySchema = z.record(errorCategorySchema, z.number().int().min(0));

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
  // One-sentence rule explanation for the current grammar topic. Maintained
  // by the AI: included when the topic changes (or when it's blank), omitted
  // on subsequent turns of the same topic. Defaults to '' so old checkpoints
  // without this field still parse.
  rule: z.string().default(''),
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
  // Lifetime per-category counts — see mistakesByCategorySchema above. Default
  // {} so checkpoints persisted before this field existed still parse cleanly.
  mistakesByCategory: mistakesByCategorySchema.default({}),
});

// Patch shape the AI returns in `updatedCheckpoint`. Both top-level keys AND
// the two nested objects are partial — the model commonly sends only the
// inner fields that changed. `mergeCheckpoint` in src/storage shallow-merges
// the nested objects against the stored checkpoint, then re-validates the
// whole thing against learningCheckpointSchema, so the strict invariant
// still holds after the merge.
// Patch shape the AI is allowed to send. `mistakesByCategory` is intentionally
// excluded — that field is client-owned (we bump it ourselves so the AI can't
// drift the counters). If the AI sends it, Zod's default behaviour will accept
// extra unknown keys, but the merge logic in storage doesn't read them.
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
