import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setCheckpoint } from '../../storage';
import type {
  Exercise,
  LearningCheckpoint,
  TutorResponse,
  UserProfile,
} from '../../types';
import { PracticeScreen } from './PracticeScreen';

vi.mock('../../ai', async () => {
  const actual = await vi.importActual<typeof import('../../ai')>('../../ai');
  return {
    ...actual,
    requestTutorTurn: vi.fn(),
  };
});

const { requestTutorTurn } = await import('../../ai');
const mockedRequest = vi.mocked(requestTutorTurn);

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
  lastCheckpointSummary: 'Singular subjects take -s in Present Simple.',
};

const firstExercise: Exercise = {
  sourceLanguage: 'ru',
  targetLanguage: 'en',
  sentence: 'Этот сервис читает сообщения.',
  grammarTopic: 'Present Simple',
  difficulty: 2,
};

const secondExercise: Exercise = {
  sourceLanguage: 'ru',
  targetLanguage: 'en',
  sentence: 'Эта команда деплоит сервис каждый вторник.',
  grammarTopic: 'Present Simple',
  difficulty: 2,
};

function bootstrapResponse(nextExercise: Exercise = firstExercise): TutorResponse {
  return {
    messageToUser: 'Here is your first sentence.',
    mistakes: [],
    updatedCheckpoint: {},
    nextExercise,
  };
}

function reviewResponse(
  correctedAnswer: string,
  nextExercise: Exercise = secondExercise,
): TutorResponse {
  return {
    messageToUser: 'Good try — fixed a couple of things.',
    correctedAnswer,
    mistakes: [
      {
        type: 'Third-person singular -s',
        example: 'service read',
        correction: 'service reads',
        explanation: 'Singular subject takes -s in Present Simple.',
      },
      {
        type: 'Articles with technology names',
        example: 'from the Kafka',
        correction: 'from Kafka',
        explanation: 'Tech product names usually take no article.',
      },
    ],
    updatedCheckpoint: {
    },
    nextExercise,
  };
}

beforeEach(() => {
  localStorage.clear();
  // setCheckpoint carries the profile via the nested userProfile field.
  setCheckpoint(checkpoint);
  mockedRequest.mockReset();
});

afterEach(() => {
  localStorage.clear();
});

describe('PracticeScreen', () => {
  it('renders the input phase with the source sentence after bootstrap', async () => {
    mockedRequest.mockResolvedValueOnce({ kind: 'ok', response: bootstrapResponse() });
    render(<PracticeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Этот сервис читает сообщения.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
    expect(screen.queryByText(/Saved to your deck/i)).not.toBeInTheDocument();
  });

  it('advances to review and renders the corrected text on a successful turn', async () => {
    const user = userEvent.setup();
    mockedRequest
      .mockResolvedValueOnce({ kind: 'ok', response: bootstrapResponse() })
      .mockResolvedValueOnce({
        kind: 'ok',
        response: reviewResponse('This service reads messages.'),
      });

    render(<PracticeScreen />);

    await waitFor(() =>
      expect(screen.getByText('Этот сервис читает сообщения.')).toBeInTheDocument(),
    );

    const input = screen.getByLabelText(/translation input/i);
    await user.type(input, 'This service read messages.');
    await user.click(screen.getByRole('button', { name: /check/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument(),
    );

    // Mistakes render as a bulleted list, one bullet per unique type.
    expect(screen.getByText(/Third-person singular -s\./)).toBeInTheDocument();
    expect(screen.getByText(/Articles with technology names\./)).toBeInTheDocument();

    // The corrected words appear via the inline diff.
    expect(screen.getByText('reads')).toBeInTheDocument();
    expect(screen.getByText('Good try — fixed a couple of things.')).toBeInTheDocument();
    expect(mockedRequest).toHaveBeenCalledTimes(2);
  });

  it('renders a retry-able error when the server responds with a network error', async () => {
    mockedRequest.mockResolvedValueOnce({
      kind: 'network-error',
      message: 'Upstream broken',
    });

    render(<PracticeScreen />);

    await waitFor(() =>
      expect(screen.getByText(/upstream broken/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('next after review clears input and uses the new exercise as source', async () => {
    const user = userEvent.setup();
    mockedRequest
      .mockResolvedValueOnce({ kind: 'ok', response: bootstrapResponse() })
      .mockResolvedValueOnce({
        kind: 'ok',
        response: reviewResponse('This service reads messages.', secondExercise),
      });

    render(<PracticeScreen />);
    await waitFor(() =>
      expect(screen.getByText('Этот сервис читает сообщения.')).toBeInTheDocument(),
    );

    const input = screen.getByLabelText(/translation input/i) as HTMLInputElement;
    await user.type(input, 'This service read messages.');
    await user.click(screen.getByRole('button', { name: /check/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next exercise/i })).toBeInTheDocument(),
    );

    // In review phase the InputDock is replaced by a single Next CTA — the
    // translation input shouldn't be in the DOM at all.
    expect(screen.queryByLabelText(/translation input/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next exercise/i }));

    // Back in input phase: new exercise sentence, fresh empty input, Check CTA.
    expect(screen.getByText(secondExercise.sentence)).toBeInTheDocument();
    const newInput = screen.getByLabelText(/translation input/i) as HTMLInputElement;
    expect(newInput.value).toBe('');
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
  });

  it('never renders the vocabulary "Saved to your deck" string', async () => {
    mockedRequest
      .mockResolvedValueOnce({ kind: 'ok', response: bootstrapResponse() })
      .mockResolvedValueOnce({
        kind: 'ok',
        response: reviewResponse('This service reads messages.'),
      });

    render(<PracticeScreen />);
    await waitFor(() =>
      expect(screen.getByText('Этот сервис читает сообщения.')).toBeInTheDocument(),
    );
    const input = screen.getByLabelText(/translation input/i);
    await userEvent.type(input, 'This service read messages.');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument(),
    );

    expect(screen.queryByText(/Saved to your deck/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cards saved/i)).not.toBeInTheDocument();
  });

  it('submits only once per click', async () => {
    const user = userEvent.setup();
    type Resolver = (value: { kind: 'ok'; response: TutorResponse }) => void;
    const holder: { resolve: Resolver | null } = { resolve: null };
    mockedRequest
      .mockResolvedValueOnce({ kind: 'ok', response: bootstrapResponse() })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            holder.resolve = resolve as Resolver;
          }),
      );

    render(<PracticeScreen />);
    await waitFor(() =>
      expect(screen.getByText('Этот сервис читает сообщения.')).toBeInTheDocument(),
    );

    const input = screen.getByLabelText(/translation input/i);
    await user.type(input, 'This service read messages.');
    const checkBtn = screen.getByRole('button', { name: /check/i });
    await user.click(checkBtn);
    // Disabled while in-flight, but extra clicks must not fire a second request.
    await user.click(checkBtn);
    await user.click(checkBtn);

    // 1 bootstrap + 1 submit = 2 calls total, never more.
    expect(mockedRequest).toHaveBeenCalledTimes(2);

    holder.resolve?.({
      kind: 'ok',
      response: reviewResponse('This service reads messages.'),
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument(),
    );
  });
});
