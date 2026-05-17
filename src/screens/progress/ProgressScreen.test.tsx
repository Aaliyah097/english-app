import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setCheckpoint } from '../../storage';
import type { LearningCheckpoint } from '../../types';
import { ProgressScreen } from './ProgressScreen';

const baseCheckpoint: LearningCheckpoint = {
  userProfile: {
    nativeLanguage: 'ru',
    targetLanguage: 'en',
    level: 'intermediate',
    interests: ['software development'],
    goal: 'work communication',
    preferredPracticeMode: 'translation',
  },
  currentLearningFocus: {
    grammarTopic: 'Past Simple',
    sentenceType: 'statement',
    difficulty: 3,
  },
  recentMistakes: [
    {
      type: 'Article use',
      example: 'I am developer.',
      correction: 'I am a developer.',
    },
    {
      type: 'Past tense form',
      example: 'I goed home.',
      correction: 'I went home.',
    },
  ],
  completedTopics: ['Present Simple', 'Present Continuous'],
  currentTopicProgress: {
    topic: 'Past Simple',
    completedExercises: 7,
    knownWeaknesses: ['irregular verbs'],
  },
  lastCheckpointSummary: 'Working on past tense forms.',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('ProgressScreen', () => {
  it('renders the current topic name when a checkpoint exists', () => {
    setCheckpoint(baseCheckpoint);
    render(<ProgressScreen />);

    // The current focus card shows the topic name. Use getAllBy because
    // "Past Simple" also appears as the "current" row in the grammar path.
    expect(screen.getAllByText('Past Simple').length).toBeGreaterThan(0);
    // Exercises completed surfaces next to its label.
    expect(screen.getByText(/exercises completed/i)).toBeInTheDocument();
    // Recent mistakes surface.
    expect(screen.getByText('Article use')).toBeInTheDocument();
    expect(screen.getByText('Past tense form')).toBeInTheDocument();
  });

  it('renders the empty state and fires onGoToPractice when no checkpoint exists', async () => {
    const onGoToPractice = vi.fn();
    render(<ProgressScreen onGoToPractice={onGoToPractice} />);

    expect(
      screen.getByText(/start practising to see your progress/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /go to practice/i }));
    expect(onGoToPractice).toHaveBeenCalledTimes(1);
  });

  it('omits any vocabulary scope (regression guard for v1)', () => {
    setCheckpoint(baseCheckpoint);
    const { container } = render(<ProgressScreen />);

    // The mockup's vocabulary count card must stay omitted in MVP v1.
    expect(container.textContent ?? '').not.toMatch(/vocabulary/i);
    expect(container.textContent ?? '').not.toMatch(/cards saved/i);
  });
});
