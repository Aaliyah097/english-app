import { describe, expect, it } from 'vitest';
import type { Exercise, LearningCheckpoint, UserProfile } from '../types';
import { buildSystemPrompt, buildTurnUserPrompt } from './prompts';

const profile: UserProfile = {
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['software development'],
  goal: 'work',
  preferredPracticeMode: 'translation',
};

const checkpoint: LearningCheckpoint = {
  userProfile: profile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
  recentMistakes: [],
  completedTopics: [],
  currentTopicProgress: {
    topic: 'Present Simple',
    completedExercises: 3,
    knownWeaknesses: [],
  },
  lastCheckpointSummary: '',
};

const exercise: Exercise = {
  sourceLanguage: 'ru',
  targetLanguage: 'en',
  sentence: 'Этот сервис читает сообщения из Kafka.',
  grammarTopic: 'Present Simple',
  difficulty: 2,
};

describe('buildSystemPrompt', () => {
  it('includes native + target language and level', () => {
    const sys = buildSystemPrompt(profile);
    expect(sys).toContain('"ru"');
    expect(sys).toContain('"en"');
    expect(sys).toContain('"intermediate"');
  });

  it('does not mention vocabulary or cards (out of MVP v1)', () => {
    const sys = buildSystemPrompt(profile);
    expect(sys.toLowerCase()).not.toContain('vocabulary');
    expect(sys.toLowerCase()).not.toContain('card');
  });

  it('produces a stable snapshot', () => {
    expect(buildSystemPrompt(profile)).toMatchSnapshot();
  });
});

describe('buildTurnUserPrompt', () => {
  it('includes all four labelled sections', () => {
    const p = buildTurnUserPrompt({
      userProfile: profile,
      checkpoint,
      currentExercise: exercise,
      userAnswer: 'This service read messages from the Kafka.',
    });
    expect(p).toContain('# USER_PROFILE');
    expect(p).toContain('# CHECKPOINT');
    expect(p).toContain('# CURRENT_EXERCISE');
    expect(p).toContain('# USER_ANSWER');
  });

  it('does not mention vocabulary or cards (out of MVP v1)', () => {
    const p = buildTurnUserPrompt({
      userProfile: profile,
      checkpoint,
      currentExercise: exercise,
      userAnswer: '',
    });
    expect(p.toLowerCase()).not.toContain('vocabulary');
    expect(p.toLowerCase()).not.toContain('"card"');
  });

  it('produces a stable snapshot', () => {
    expect(
      buildTurnUserPrompt({
        userProfile: profile,
        checkpoint,
        currentExercise: exercise,
        userAnswer: 'This service read messages from the Kafka.',
      }),
    ).toMatchSnapshot();
  });
});
