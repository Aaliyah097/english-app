import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { learningCheckpointSchema, userProfileSchema } from '../../schemas';
import { getCheckpoint, getUserProfile } from '../../storage';
import { t } from '../../i18n';
import { OnboardingScreen } from './OnboardingScreen';

// Onboarding runs before the profile exists, so the UI is in Russian — the
// app's default locale. We pull the expected labels through t() so the tests
// keep working if Russian copy is later refined.
const RU = (key: Parameters<typeof t>[1]) => t('ru', key);

describe('OnboardingScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the welcome step on mount (in Russian)', () => {
    render(<OnboardingScreen />);
    expect(
      screen.getByRole('button', { name: RU('onboarding.button.begin') }),
    ).toBeInTheDocument();
  });

  it('advances to the languages step when "Begin" is clicked', async () => {
    const user = userEvent.setup();
    render(<OnboardingScreen />);
    await user.click(screen.getByRole('button', { name: RU('onboarding.button.begin') }));
    expect(
      screen.getByRole('button', { name: RU('onboarding.button.continue') }),
    ).toBeInTheDocument();
  });

  it('walks through all five steps and persists a valid profile + checkpoint', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OnboardingScreen onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: RU('onboarding.button.begin') }));
    await user.click(screen.getByRole('button', { name: RU('onboarding.button.continue') }));
    await user.click(screen.getByRole('button', { name: RU('onboarding.button.continue') }));
    await user.click(screen.getByRole('button', { name: RU('onboarding.button.continue') }));
    await user.click(
      screen.getByRole('button', { name: RU('onboarding.button.startPractising') }),
    );

    expect(onComplete).toHaveBeenCalledOnce();

    const profile = getUserProfile();
    expect(profile).not.toBeNull();
    expect(() => userProfileSchema.parse(profile)).not.toThrow();

    const checkpoint = getCheckpoint();
    expect(checkpoint).not.toBeNull();
    expect(() => learningCheckpointSchema.parse(checkpoint)).not.toThrow();

    // Sanity checks on contents
    expect(profile?.nativeLanguage).toBe('ru');
    expect(profile?.targetLanguage).toBe('en');
    expect(profile?.preferredPracticeMode).toBe('translation');
    expect(profile?.goal).toBe('work');
    expect(checkpoint?.currentLearningFocus.grammarTopic).toBe('Present Simple');
  });
});
