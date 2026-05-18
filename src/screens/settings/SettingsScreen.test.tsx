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
  interests: ['Software development', 'Software architecture'],
  preferredPracticeMode: 'translation',
});

const SAMPLE_CHECKPOINT: LearningCheckpoint = learningCheckpointSchema.parse({
  userProfile: SAMPLE_PROFILE,
  currentLearningFocus: { grammarTopic: 'Present Simple', rule: '' },
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

    // Toggle 'Software development' off (it was seeded).
    await user.click(screen.getByRole('button', { name: /Software development/i }));
    expect(getUserProfile()?.interests).not.toContain('Software development');
  });
});
