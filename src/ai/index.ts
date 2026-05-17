// AI client. The browser no longer talks to DeepSeek directly — that would
// require shipping our API key in the public bundle. Instead it POSTs to
// /api/tutor (a Vercel serverless function under `api/tutor.ts`) which holds
// the key as a server env var, builds the prompt, calls DeepSeek, and
// returns a validated TutorResponse.
//
// See docs/PLAN.md §1 for the architecture decision.

import { tutorResponseSchema } from '../schemas';
import type { Exercise, LearningCheckpoint, TutorResponse, UserProfile } from '../types';

export const PROXY_URL = '/api/tutor';

export type TutorTurnInput = {
  userProfile: UserProfile;
  checkpoint: LearningCheckpoint;
  currentExercise: Exercise;
  userAnswer: string;
};

export type TutorTurnResult =
  | { kind: 'ok'; response: TutorResponse }
  | { kind: 'network-error'; message: string }
  | { kind: 'invalid-response'; message: string };

export async function requestTutorTurn(
  input: TutorTurnInput,
): Promise<TutorTurnResult> {
  let res: Response;
  try {
    res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { kind: 'network-error', message: (err as Error).message };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    return {
      kind: 'invalid-response',
      message: `Response was not JSON: ${(err as Error).message}`,
    };
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' && body && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed with status ${res.status}`;
    return { kind: 'network-error', message };
  }

  const parsed = tutorResponseSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const msg = first ? `${first.path.join('.')}: ${first.message}` : 'schema validation failed';
    return { kind: 'invalid-response', message: `Server response did not match the tutor schema (${msg})` };
  }
  return { kind: 'ok', response: parsed.data };
}
