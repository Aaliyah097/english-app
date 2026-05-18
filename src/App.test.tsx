import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { setCheckpoint } from './storage';
import type { LearningCheckpoint, UserProfile } from './types';

vi.mock('./ai', async () => {
  const actual = await vi.importActual<typeof import('./ai')>('./ai');
  return {
    ...actual,
    requestTutorTurn: vi.fn(async () => ({
      kind: 'network-error' as const,
      message: 'mocked',
    })),
  };
});

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
    expect(screen.getByRole('button', { name: /начать/i })).toBeInTheDocument();
    expect(screen.queryByTestId('screen-placeholder')).not.toBeInTheDocument();
  });

  it('renders the practice screen once a checkpoint exists', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /начать/i })).toBeInTheDocument();

    // Writing the checkpoint (which carries the profile) notifies subscribers
    // and flips the App out of onboarding into the main shell.
    act(() => {
      setCheckpoint(checkpoint);
    });

    expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
  });

  it('opens Settings from the TopicBar cog and returns via Back', async () => {
    setCheckpoint(checkpoint);
    render(<App />);

    expect(screen.getByTestId('practice-screen')).toBeInTheDocument();

    // The cog in PracticeScreen's TopicBar has aria-label="Settings".
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.queryByTestId('practice-screen')).not.toBeInTheDocument();

    // Back returns to Practice.
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
  });
});
