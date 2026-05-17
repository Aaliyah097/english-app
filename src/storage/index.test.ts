import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LearningCheckpoint, UserProfile } from '../types';
import {
  exportAll,
  getApiKey,
  getCheckpoint,
  getUserProfile,
  importAll,
  mergeCheckpoint,
  resetAll,
  setApiKey,
  setCheckpoint,
  setUserProfile,
  subscribe,
} from './index';
import { STORAGE_KEYS } from './keys';

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
    completedExercises: 0,
    knownWeaknesses: [],
  },
  lastCheckpointSummary: '',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('storage — profile', () => {
  it('round-trips through set → get', () => {
    expect(getUserProfile()).toBeNull();
    setUserProfile(profile);
    expect(getUserProfile()).toEqual(profile);
  });

  it('returns null when stored JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEYS.profile, '{not json');
    expect(getUserProfile()).toBeNull();
  });

  it('returns null when stored data fails schema validation', () => {
    localStorage.setItem(
      STORAGE_KEYS.profile,
      JSON.stringify({ nativeLanguage: 'ru' }),
    );
    expect(getUserProfile()).toBeNull();
  });
});

describe('storage — checkpoint', () => {
  it('round-trips through set → get', () => {
    setCheckpoint(checkpoint);
    expect(getCheckpoint()).toEqual(checkpoint);
  });

  it('mergeCheckpoint shallow-merges nested currentLearningFocus', () => {
    setCheckpoint(checkpoint);
    const merged = mergeCheckpoint({
      currentLearningFocus: { grammarTopic: 'Past Simple', difficulty: 3 },
    });
    expect(merged.currentLearningFocus).toEqual({
      grammarTopic: 'Past Simple',
      difficulty: 3,
    });
    // Top-level untouched fields preserved.
    expect(merged.userProfile).toEqual(profile);
    expect(merged.lastCheckpointSummary).toBe('');
  });

  it('mergeCheckpoint shallow-merges currentTopicProgress', () => {
    setCheckpoint(checkpoint);
    const merged = mergeCheckpoint({
      currentTopicProgress: {
        topic: 'Present Simple',
        completedExercises: 5,
        knownWeaknesses: [],
      },
    });
    expect(merged.currentTopicProgress.completedExercises).toBe(5);
  });

  it('mergeCheckpoint throws when no checkpoint exists', () => {
    expect(() => mergeCheckpoint({})).toThrow();
  });
});

describe('storage — apiKey', () => {
  it('round-trips and trims', () => {
    setApiKey('  sk-test-123  ');
    expect(getApiKey()).toBe('sk-test-123');
  });

  it('clears when set to null or empty', () => {
    setApiKey('sk-test');
    setApiKey(null);
    expect(getApiKey()).toBeNull();
    setApiKey('sk-test');
    setApiKey('   ');
    expect(getApiKey()).toBeNull();
  });
});

describe('storage — export/import/reset', () => {
  it('exportAll → importAll round-trips profile + checkpoint', () => {
    setUserProfile(profile);
    setCheckpoint(checkpoint);
    const exported = exportAll();

    localStorage.clear();
    expect(getUserProfile()).toBeNull();

    importAll(exported);
    expect(getUserProfile()).toEqual(profile);
    expect(getCheckpoint()).toEqual(checkpoint);
  });

  it('exportAll does not include the api key', () => {
    setApiKey('sk-secret');
    setUserProfile(profile);
    const exported = exportAll();
    expect(exported).not.toContain('sk-secret');
    expect(exported).not.toContain('apiKey');
  });

  it('importAll rejects malformed JSON without touching existing state', () => {
    setUserProfile(profile);
    expect(() => importAll('not json')).toThrow(/JSON/);
    expect(getUserProfile()).toEqual(profile);
  });

  it('importAll rejects wrong schema without touching existing state', () => {
    setUserProfile(profile);
    expect(() => importAll('{"schemaVersion":99}')).toThrow();
    expect(getUserProfile()).toEqual(profile);
  });

  it('resetAll clears everything including the api key', () => {
    setUserProfile(profile);
    setCheckpoint(checkpoint);
    setApiKey('sk-secret');
    resetAll();
    expect(getUserProfile()).toBeNull();
    expect(getCheckpoint()).toBeNull();
    expect(getApiKey()).toBeNull();
  });
});

describe('storage — pub-sub', () => {
  it('subscribe receives a notification on every setter', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    setUserProfile(profile);
    setApiKey('sk');
    setApiKey(null);
    setCheckpoint(checkpoint);
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(4);
    unsubscribe();
    listener.mockClear();
    setApiKey('again');
    expect(listener).not.toHaveBeenCalled();
  });
});
