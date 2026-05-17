import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LearningCheckpoint, UserProfile } from '../types';
import {
  bumpMistakeCategories,
  exportAll,
  getCheckpoint,
  getUserProfile,
  importAll,
  mergeCheckpoint,
  resetAll,
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
  preferredPracticeMode: 'translation',
};

const checkpoint: LearningCheckpoint = {
  userProfile: profile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2, rule: '' },
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

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('storage — profile (derived from the checkpoint)', () => {
  it('returns null when no checkpoint exists', () => {
    expect(getUserProfile()).toBeNull();
  });

  it('reads the profile out of the checkpoint', () => {
    setCheckpoint(checkpoint);
    expect(getUserProfile()).toEqual(profile);
  });

  it('round-trips through setUserProfile when a checkpoint exists', () => {
    setCheckpoint(checkpoint);
    const updated: UserProfile = { ...profile, targetLanguage: 'es' };
    setUserProfile(updated);
    expect(getUserProfile()).toEqual(updated);
  });

  it('throws when setUserProfile is called without a checkpoint', () => {
    expect(() => setUserProfile(profile)).toThrow(/no checkpoint/);
  });

  it('returns null when stored checkpoint JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEYS.checkpoint, '{not json');
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
      currentLearningFocus: { grammarTopic: 'Past Simple', difficulty: 3, rule: '' },
    });
    expect(merged.currentLearningFocus).toEqual({
      grammarTopic: 'Past Simple',
      difficulty: 3,
      rule: '',
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

  it('setUserProfile syncs the checkpoint.userProfile nested copy', () => {
    setCheckpoint(checkpoint);
    const updated: UserProfile = { ...profile, targetLanguage: 'es' };
    setUserProfile(updated);
    const stored = getCheckpoint();
    expect(stored?.userProfile.targetLanguage).toBe('es');
    // Other checkpoint fields are untouched.
    expect(stored?.currentLearningFocus.grammarTopic).toBe('Present Simple');
  });

  it('mergeCheckpoint preserves mistakesByCategory across AI patches', () => {
    setCheckpoint({ ...checkpoint, mistakesByCategory: { articles: 3 } });
    const merged = mergeCheckpoint({
      currentLearningFocus: { grammarTopic: 'Past Simple', difficulty: 3, rule: '' },
    });
    expect(merged.mistakesByCategory).toEqual({ articles: 3 });
  });
});

describe('storage — bumpMistakeCategories', () => {
  it('increments fresh categories from zero', () => {
    setCheckpoint(checkpoint);
    const result = bumpMistakeCategories(['articles', 'tense_form']);
    expect(result.mistakesByCategory).toEqual({ articles: 1, tense_form: 1 });
  });

  it('deduplicates within a single call so one turn = one bump', () => {
    setCheckpoint(checkpoint);
    const result = bumpMistakeCategories(['articles', 'articles', 'articles']);
    expect(result.mistakesByCategory).toEqual({ articles: 1 });
  });

  it('accumulates across calls', () => {
    setCheckpoint(checkpoint);
    bumpMistakeCategories(['articles']);
    bumpMistakeCategories(['articles', 'prepositions']);
    const c = getCheckpoint();
    expect(c?.mistakesByCategory).toEqual({ articles: 2, prepositions: 1 });
  });

  it('is a no-op when given an empty list', () => {
    setCheckpoint({ ...checkpoint, mistakesByCategory: { articles: 5 } });
    const result = bumpMistakeCategories([]);
    expect(result.mistakesByCategory).toEqual({ articles: 5 });
  });
});

describe('storage — export/import/reset', () => {
  it('exportAll → importAll round-trips the checkpoint (carrying the profile)', () => {
    setCheckpoint(checkpoint);
    const exported = exportAll();

    localStorage.clear();
    expect(getCheckpoint()).toBeNull();

    importAll(exported);
    expect(getCheckpoint()).toEqual(checkpoint);
    expect(getUserProfile()).toEqual(profile);
  });

  it('importAll rejects malformed JSON without touching existing state', () => {
    setCheckpoint(checkpoint);
    expect(() => importAll('not json')).toThrow(/JSON/);
    expect(getCheckpoint()).toEqual(checkpoint);
  });

  it('importAll rejects wrong schema without touching existing state', () => {
    setCheckpoint(checkpoint);
    expect(() => importAll('{"schemaVersion":99}')).toThrow();
    expect(getCheckpoint()).toEqual(checkpoint);
  });

  it('resetAll clears the checkpoint', () => {
    setCheckpoint(checkpoint);
    resetAll();
    expect(getCheckpoint()).toBeNull();
    expect(getUserProfile()).toBeNull();
  });
});

describe('storage — pub-sub', () => {
  it('subscribe receives a notification on every setter', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    setCheckpoint(checkpoint);
    setUserProfile({ ...profile, targetLanguage: 'es' });
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
    unsubscribe();
    listener.mockClear();
    setCheckpoint(checkpoint);
    expect(listener).not.toHaveBeenCalled();
  });
});
