import { describe, expect, it } from 'vitest';
import {
  learningCheckpointSchema,
  mistakeSchema,
  partialLearningCheckpointSchema,
  tutorResponseSchema,
  userProfileSchema,
} from './schemas';
import type { TutorResponse, UserProfile, LearningCheckpoint } from './types';

const validProfile: UserProfile = {
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['software development'],
  preferredPracticeMode: 'translation',
};

const validCheckpoint: LearningCheckpoint = {
  userProfile: validProfile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2, rule: '' },
  lastCheckpointSummary: '',
};

const validResponse: TutorResponse = {
  messageToUser: 'Nice attempt. The verb should agree with the singular subject.',
  mistakes: [
    {
      type: 'Third-person singular -s',
      example: 'the service read',
      correction: 'the service reads',
      explanation: 'A singular subject takes -s in Present Simple.',
    },
  ],
  correctedAnswer: 'This service reads messages from Kafka.',
  updatedCheckpoint: {
    currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2, rule: '' },
  },
  nextExercise: {
    sourceLanguage: 'ru',
    targetLanguage: 'en',
    sentence: 'Этот сервис сохраняет события в базе данных.',
    grammarTopic: 'Present Simple',
    difficulty: 2,
  },
};

describe('schemas', () => {
  it('userProfileSchema accepts a valid profile', () => {
    expect(userProfileSchema.parse(validProfile)).toEqual(validProfile);
  });

  it('userProfileSchema rejects an unknown level', () => {
    const bad = { ...validProfile, level: 'expert' };
    expect(userProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('learningCheckpointSchema accepts a valid checkpoint', () => {
    expect(learningCheckpointSchema.parse(validCheckpoint)).toEqual(validCheckpoint);
  });

  it('partialLearningCheckpointSchema accepts an empty object', () => {
    expect(partialLearningCheckpointSchema.parse({})).toEqual({});
  });

  it('partialLearningCheckpointSchema accepts a partial nested currentLearningFocus', () => {
    // The AI commonly sends only the inner fields that changed (e.g. just
    // `rule` without re-stating grammarTopic + difficulty). This must parse —
    // mergeCheckpoint deep-merges before re-validating against the strict
    // schema.
    const partialPatch = {
      currentLearningFocus: { rule: 'Use Past Simple for finished actions.' },
    };
    expect(partialLearningCheckpointSchema.safeParse(partialPatch).success).toBe(true);
  });

  it('tutorResponseSchema accepts a valid response', () => {
    expect(tutorResponseSchema.parse(validResponse)).toEqual(validResponse);
  });

  it('tutorResponseSchema rejects a missing messageToUser', () => {
    const { messageToUser: _drop, ...withoutMessage } = validResponse;
    const result = tutorResponseSchema.safeParse(withoutMessage);
    expect(result.success).toBe(false);
  });

  it('tutorResponseSchema rejects a difficulty out of bounds', () => {
    const bad = {
      ...validResponse,
      nextExercise: { ...validResponse.nextExercise, difficulty: 99 },
    };
    expect(tutorResponseSchema.safeParse(bad).success).toBe(false);
  });

  // ── Security: length caps + closed-set enforcement ────────────────────────

  it('userProfileSchema rejects an oversized interest string', () => {
    const bad = { ...validProfile, interests: ['x'.repeat(100)] };
    expect(userProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('userProfileSchema rejects more than 20 interests', () => {
    const bad = {
      ...validProfile,
      interests: Array.from({ length: 21 }, (_, i) => `int-${i}`),
    };
    expect(userProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('mistakeSchema rejects an oversized explanation', () => {
    const bad = {
      type: 'Articles',
      example: 'a',
      correction: 'an',
      explanation: 'x'.repeat(600),
    };
    expect(mistakeSchema.safeParse(bad).success).toBe(false);
  });

  it('tutorResponseSchema rejects an oversized messageToUser', () => {
    const bad = { ...validResponse, messageToUser: 'x'.repeat(1100) };
    expect(tutorResponseSchema.safeParse(bad).success).toBe(false);
  });
});
