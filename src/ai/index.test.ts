import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise, LearningCheckpoint, UserProfile } from '../types';
import { PROXY_URL, requestTutorTurn } from './index';

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
  mistakesByCategory: {},
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

const validPayload = {
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
};

const originalFetch = globalThis.fetch;

beforeEach(() => {
  // Each test installs its own fetch mock.
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchOnce(response: { status?: number; body: unknown }) {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
    new Response(JSON.stringify(response.body), {
      status: response.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('requestTutorTurn', () => {
  it('POSTs to /api/tutor with the input as JSON', async () => {
    mockFetchOnce({ body: validPayload });
    await requestTutorTurn(input);
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledWith(
      PROXY_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const sent = JSON.parse(firstCall![1].body as string);
    expect(sent.userAnswer).toBe('I work.');
  });

  it('returns {kind:"ok", response} on a valid payload', async () => {
    mockFetchOnce({ body: validPayload });
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.response.messageToUser).toBe('Looks good.');
    }
  });

  it('returns {kind:"network-error"} when fetch throws', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch'),
    );
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('network-error');
    if (result.kind === 'network-error') {
      expect(result.message).toMatch(/Failed to fetch/);
    }
  });

  it('returns {kind:"network-error"} when the server responds non-2xx', async () => {
    mockFetchOnce({ status: 500, body: { error: 'Upstream broken' } });
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('network-error');
    if (result.kind === 'network-error') {
      expect(result.message).toMatch(/Upstream broken/);
    }
  });

  it('returns {kind:"invalid-response"} when the payload does not match the schema', async () => {
    mockFetchOnce({ body: { messageToUser: 'hi' } });
    const result = await requestTutorTurn(input);
    expect(result.kind).toBe('invalid-response');
  });
});
