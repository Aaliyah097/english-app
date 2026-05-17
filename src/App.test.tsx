import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { setUserProfile } from './storage';
import type { UserProfile } from './types';

const profile: UserProfile = {
  nativeLanguage: 'ru',
  targetLanguage: 'en',
  level: 'intermediate',
  interests: ['software development'],
  goal: 'work',
  preferredPracticeMode: 'translation',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('renders the onboarding screen when no profile is stored', () => {
    render(<App />);
    // S06's StepWelcome shows the "Begin" CTA — assert on that as the
    // smallest stable indicator that we're in the onboarding flow.
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();
    expect(screen.queryByTestId('screen-placeholder')).not.toBeInTheDocument();
  });

  it('renders the practice screen once a profile exists', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();

    // Writing a profile notifies subscribers — App should re-render into the
    // main shell with Practice as the default tab.
    act(() => {
      setUserProfile(profile);
    });

    expect(screen.getByTestId('screen-placeholder')).toHaveAttribute(
      'data-screen',
      'Practice',
    );
    expect(screen.getByRole('button', { name: /practice/i })).toBeInTheDocument();
  });

  it('switches the active screen when a BottomNav tab is clicked', async () => {
    setUserProfile(profile);
    render(<App />);

    expect(screen.getByTestId('screen-placeholder')).toHaveAttribute(
      'data-screen',
      'Practice',
    );

    await userEvent.click(screen.getByRole('button', { name: /progress/i }));

    // S10 replaced the Progress placeholder with the real screen — its empty
    // state copy is the smallest stable signal that we routed there.
    expect(
      screen.getByText(/start practising to see your progress/i),
    ).toBeInTheDocument();
  });
});
