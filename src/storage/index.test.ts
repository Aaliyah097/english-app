import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LearningCheckpoint, UserProfile } from '../types';
import {
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
  lastCheckpointSummary: '',
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
