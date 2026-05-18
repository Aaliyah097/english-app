import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { learningCheckpointSchema, userProfileSchema } from '../../schemas';
import { getUserProfile, setCheckpoint } from '../../storage';
import type { LearningCheckpoint, UserProfile } from '../../types';
import { SettingsScreen } from './SettingsScreen';

const SAMPLE_PROFILE: UserProfile = userProfileSchema.parse({
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['Software dev', 'Architecture'],
  preferredPracticeMode: 'translation',
});

const SAMPLE_CHECKPOINT: LearningCheckpoint = learningCheckpointSchema.parse({
  userProfile: SAMPLE_PROFILE,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2, rule: '' },
  recentMistakes: [],
  completedTopics: [],
  currentTopicProgress: {
    topic: 'Present Simple',
    completedExercises: 0,
    knownWeaknesses: [],
  },
  lastCheckpointSummary: '',
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    setCheckpoint(SAMPLE_CHECKPOINT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles an interest chip and persists it to the profile', async () => {
    const user = userEvent.setup();
    render(<SettingsScreen />);
    // 'Data' is not in SAMPLE_PROFILE.interests, so toggling adds it.
    await user.click(screen.getByRole('button', { name: 'Data' }));
    expect(getUserProfile()?.interests).toContain('Data');

    // Toggle 'Software dev' off (it was seeded).
    await user.click(screen.getByRole('button', { name: /Software dev/i }));
    expect(getUserProfile()?.interests).not.toContain('Software dev');
  });
});
