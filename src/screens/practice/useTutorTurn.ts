import { useCallback, useRef, useState } from 'react';
import { requestTutorTurn, type TutorTurnInput, type TutorTurnResult } from '../../ai';

export type TutorTurnStatus = 'idle' | 'loading' | 'done';

type State = {
  status: TutorTurnStatus;
  result: TutorTurnResult | null;
};

const INITIAL: State = { status: 'idle', result: null };

/**
 * Small wrapper around `requestTutorTurn` that tracks loading/result state and
 * guards against double-submits while a request is in flight. The screen is
 * responsible for interpreting the tagged-union result.
 */
export function useTutorTurn() {
  const [state, setState] = useState<State>(INITIAL);
  const inFlight = useRef(false);

  const send = useCallback(async (input: TutorTurnInput): Promise<TutorTurnResult | null> => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setState({ status: 'loading', result: null });
    try {
      const result = await requestTutorTurn(input);
      setState({ status: 'done', result });
      return result;
    } finally {
      inFlight.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL);
  }, []);

  return {
    status: state.status,
    result: state.result,
    send,
    reset,
  };
}
