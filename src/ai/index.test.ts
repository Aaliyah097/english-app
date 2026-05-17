import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OpenAI from 'openai';
import type { Exercise, LearningCheckpoint, UserProfile } from '../types';
import { setApiKey } from '../storage';
import { __resetAiClientCache, DEFAULT_MODEL, PROVIDER_BASE_URL } from './client';
import { requestTutorTurn } from './index';

vi.mock('openai');

const MockedOpenAI = vi.mocked(OpenAI);
const create = vi.fn();
MockedOpenAI.mockImplementation(
  () =>
    ({
      chat: { completions: { create } },
    }) as unknown as OpenAI,
);

const profile: UserProfile = {
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: [],
  goal: 'work',
  preferredPracticeMode: 'translation',
};
const checkpoint: LearningCheckpoint = {
  userProfile: profile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
  recentMistakes: [],
  completedTopics: [],
  currentTopicProgress: { topic: 'Present Simple', completedExercises: 0, knownWeaknesses: [] },
  lastCheckpointSummary: '',
};
const exercise: Exercise = {
  sourceLanguage: 'ru',
  targetLanguage: 'en',
  sentence: 'Я работаю.',
  grammarTopic: 'Present Simple',
  difficulty: 1,
};

const input = {
  userProfile: profile,
  checkpoint,
  currentExercise: exercise,
  userAnswer: 'I work.',
};

const goodPayload = JSON.stringify({
  messageToUser: 'Looks good.',
  correctedAnswer: 'I work.',
  updatedCheckpoint: {},
  nextExercise: {
    sourceLanguage: 'ru',
    targetLanguage: 'en',
    sentence: 'Я работаю удалённо.',
    grammarTopic: 'Present Simple',
    difficulty: 1,
  },
});

beforeEach(() => {
  localStorage.clear();
  __resetAiClientCache();
  MockedOpenAI.mockClear();
  create.mockReset();
});

afterEach(() => {
  localStorage.clear();
  __resetAiClientCache();
});

describe('requestTutorTurn', () => {
  it('returns {kind:"no-key"} when no api key is stored', async () => {
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('no-key');
    expect(MockedOpenAI).not.toHaveBeenCalled();
  });

  it('instantiates OpenAI with the DeepSeek base URL and dangerouslyAllowBrowser', async () => {
    setApiKey('sk-test');
    create.mockResolvedValueOnce({ choices: [{ message: { content: goodPayload } }] });
    await requestTutorTurn(input);
    expect(MockedOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'sk-test',
        baseURL: PROVIDER_BASE_URL,
        dangerouslyAllowBrowser: true,
      }),
    );
  });

  it('calls chat.completions.create with the DeepSeek model and JSON mode', async () => {
    setApiKey('sk-test');
    create.mockResolvedValueOnce({ choices: [{ message: { content: goodPayload } }] });
    await requestTutorTurn(input);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: DEFAULT_MODEL,
        response_format: { type: 'json_object' },
      }),
    );
  });

  it('returns {kind:"ok", response} on a valid payload', async () => {
    setApiKey('sk-test');
    create.mockResolvedValueOnce({ choices: [{ message: { content: goodPayload } }] });
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.response.messageToUser).toBe('Looks good.');
    }
  });

  it('returns {kind:"network-error"} when the SDK throws', async () => {
    setApiKey('sk-test');
    create.mockRejectedValueOnce(new Error('connection refused'));
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('network-error');
    if (result.kind === 'network-error') {
      expect(result.message).toMatch(/connection refused/);
    }
  });

  it('returns {kind:"invalid-response"} on a malformed payload', async () => {
    setApiKey('sk-test');
    create.mockResolvedValueOnce({ choices: [{ message: { content: 'definitely not json' } }] });
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('invalid-response');
    if (result.kind === 'invalid-response') {
      expect(result.message).toMatch(/JSON|schema/);
    }
  });
});
