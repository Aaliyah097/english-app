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
  goal: 'work',
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

  it('setUserProfile is a no-op on the checkpoint when none exists', () => {
    setUserProfile(profile);
    expect(getCheckpoint()).toBeNull();
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

  it('resetAll clears profile and checkpoint', () => {
    setUserProfile(profile);
    setCheckpoint(checkpoint);
    resetAll();
    expect(getUserProfile()).toBeNull();
    expect(getCheckpoint()).toBeNull();
  });
});

describe('storage — pub-sub', () => {
  it('subscribe receives a notification on every setter', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    setUserProfile(profile);
    setCheckpoint(checkpoint);
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
    unsubscribe();
    listener.mockClear();
    setCheckpoint(checkpoint);
    expect(listener).not.toHaveBeenCalled();
  });
});
