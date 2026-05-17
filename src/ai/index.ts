import type { Exercise, LearningCheckpoint, TutorResponse, UserProfile } from '../types';
import { DEFAULT_MODEL, PROVIDER_BASE_URL, getAiClient } from './client';
import { parseTutorResponse } from './parse';
import { buildSystemPrompt, buildTurnUserPrompt } from './prompts';

export { DEFAULT_MODEL, PROVIDER_BASE_URL };

export type TutorTurnInput = {
  userProfile: UserProfile;
  checkpoint: LearningCheckpoint;
  currentExercise: Exercise;
  userAnswer: string;
};

export type TutorTurnResult =
  | { kind: 'ok'; response: TutorResponse }
  | { kind: 'no-key' }
  | { kind: 'network-error'; message: string }
  | { kind: 'invalid-response'; message: string; raw: string };

export async function requestTutorTurn(
  input: TutorTurnInput,
): Promise<TutorTurnResult> {
  const client = getAiClient();
  if (!client) return { kind: 'no-key' };

  const system = buildSystemPrompt(input.userProfile);
  const user = buildTurnUserPrompt(input);

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
  } catch (err) {
    return { kind: 'network-error', message: (err as Error).message };
  }

  const raw = completion.choices[0]?.message?.content ?? '';
  const parsed = parseTutorResponse(raw);
  if (!parsed.ok) {
    return { kind: 'invalid-response', message: parsed.error, raw };
  }
  return { kind: 'ok', response: parsed.response };
}
