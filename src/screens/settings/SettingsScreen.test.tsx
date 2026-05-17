import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userProfileSchema } from '../../schemas';
import { exportAll, getUserProfile, setUserProfile } from '../../storage';
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
    vi.spyOn(window, 'confirm').mockReturnValue(true);
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

  it('round-trips the exported JSON back through importAll', async () => {
    const user = userEvent.setup();
    const json = exportAll();
    render(<SettingsScreen />);

    // Wipe the profile, then import the previously-exported payload via the
    // hidden file input.
    localStorage.clear();
    expect(getUserProfile()).toBeNull();

    const fileInput = screen.getByTestId('import-file-input') as HTMLInputElement;
    const file = new File([json], 'englishly-export.json', {
      type: 'application/json',
    });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(getUserProfile()).not.toBeNull();
    });
    expect(getUserProfile()?.goal).toBe('Work communication');
    expect(screen.getByRole('status')).toHaveTextContent(/import successful/i);
  });

  it('resets all data when confirmed', async () => {
    const user = userEvent.setup();
    render(<SettingsScreen />);
    expect(getUserProfile()).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /reset all data/i }));
    expect(getUserProfile()).toBeNull();
  });
});
