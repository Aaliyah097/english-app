import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { setCheckpoint, setUserProfile } from './storage';
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
  goal: 'work',
  preferredPracticeMode: 'translation',
};

const checkpoint: LearningCheckpoint = {
  userProfile: profile,
  currentLearningFocus: { grammarTopic: 'Present Simple', difficulty: 2 },
  recentMistakes: [],
  completedTopics: [],
  currentTopicProgress: {
    topic: 'Present Simple',
    completedExercises: 0,
    knownWeaknesses: [],
  },
  lastCheckpointSummary: '',
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
    setCheckpoint(checkpoint);
    render(<App />);
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();

    // Writing a profile notifies subscribers — App should re-render into the
    // main shell with Practice as the default tab.
    act(() => {
      setUserProfile(profile);
    });

    expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /practice/i })).toBeInTheDocument();
  });

  it('switches the active screen when a BottomNav tab is clicked', async () => {
    setUserProfile(profile);
    setCheckpoint(checkpoint);
    render(<App />);

    expect(screen.getByTestId('practice-screen')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /progress/i }));

    // With a seeded checkpoint, ProgressScreen renders its data view.
    // "Current focus" is the smallest stable signal that we routed there.
    expect(screen.getByText(/current focus/i)).toBeInTheDocument();
  });
});
