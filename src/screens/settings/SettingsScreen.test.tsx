import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userProfileSchema } from '../../schemas';
import { getUserProfile, setUserProfile } from '../../storage';
import type { UserProfile } from '../../types';
import { SettingsScreen } from './SettingsScreen';

const SAMPLE_PROFILE: UserProfile = userProfileSchema.parse({
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['Software dev', 'Architecture'],
  goal: 'Work communication',
  preferredPracticeMode: 'translation',
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    setUserProfile(SAMPLE_PROFILE);
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
