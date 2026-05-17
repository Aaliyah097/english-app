import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { learningCheckpointSchema, userProfileSchema } from '../../schemas';
import { getCheckpoint, getUserProfile } from '../../storage';
import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the welcome step on mount', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText(/Learn English/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Begin' })).toBeInTheDocument();
  });

  it('advances to the languages step when "Begin" is clicked', async () => {
    const user = userEvent.setup();
    render(<OnboardingScreen />);
    await user.click(screen.getByRole('button', { name: 'Begin' }));
    expect(screen.getByText(/native language/i)).toBeInTheDocument();
    // Default selection: Russian
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('walks through all five steps and persists a valid profile + checkpoint', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OnboardingScreen onComplete={onComplete} />);

    // Step 1: Welcome → Begin
    await user.click(screen.getByRole('button', { name: 'Begin' }));

    // Step 2: Languages (default ru) → Continue
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 3: Level (default intermediate) → Continue
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 4: Interests (defaults pre-selected) → Continue
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 5: Goal (default 'Work communication') → Start practising
    await user.click(screen.getByRole('button', { name: 'Start practising' }));

    expect(onComplete).toHaveBeenCalledOnce();

    const profile = getUserProfile();
    expect(profile).not.toBeNull();
    expect(() => userProfileSchema.parse(profile)).not.toThrow();

    const checkpoint = getCheckpoint();
    expect(checkpoint).not.toBeNull();
    expect(() => learningCheckpointSchema.parse(checkpoint)).not.toThrow();

    // Sanity checks on contents
    expect(profile?.targetLanguage).toBe('en');
    expect(profile?.preferredPracticeMode).toBe('translation');
    expect(profile?.goal).toBe('Work communication');
    expect(checkpoint?.currentLearningFocus.grammarTopic).toBe('Present Simple');
  });
});
