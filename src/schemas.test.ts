import { describe, expect, it } from 'vitest';
import {
  partialLearningCheckpointSchema,
  tutorResponseSchema,
  userProfileSchema,
  learningCheckpointSchema,
} from './schemas';
import type { TutorResponse, UserProfile, LearningCheckpoint } from './types';

const validProfile: UserProfile = {
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['software development'],
  goal: 'work',
  preferredPracticeMode: 'translation',
};

const validCheckpoint: LearningCheckpoint = {
  userProfile: validProfile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
  recentMistakes: [],
  completedTopics: [],
  currentTopicProgress: {
    topic: 'Present Simple',
    completedExercises: 0,
    knownWeaknesses: [],
  },
  lastCheckpointSummary: '',
  mistakesByCategory: {},
};

const validResponse: TutorResponse = {
  messageToUser: 'Nice attempt. The verb should agree with the singular subject.',
  mistakes: [
    {
      type: 'Third-person singular -s',
      category: 'third_person_s',
      example: 'the service read',
      correction: 'the service reads',
      explanation: 'A singular subject takes -s in Present Simple.',
    },
  ],
  correctedAnswer: 'This service reads messages from Kafka.',
  updatedCheckpoint: {
    currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
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

  it('partialLearningCheckpointSchema accepts partial nested objects', () => {
    // The AI commonly sends only the inner fields that changed (e.g. just
    // completedExercises + knownWeaknesses, omitting topic). This must parse —
    // the storage layer's mergeCheckpoint deep-merges before re-validating
    // against the strict schema.
    const partialPatch = {
      currentTopicProgress: {
        completedExercises: 4,
        knownWeaknesses: ['articles with general plurals'],
      },
    };
    expect(partialLearningCheckpointSchema.safeParse(partialPatch).success).toBe(true);
  });

  it('full learningCheckpointSchema still requires nested fields', () => {
    const incomplete = {
      ...validCheckpoint,
      currentTopicProgress: { completedExercises: 4, knownWeaknesses: [] },
    };
    expect(learningCheckpointSchema.safeParse(incomplete).success).toBe(false);
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
});
