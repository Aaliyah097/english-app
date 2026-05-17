import { tutorResponseSchema } from '../schemas';
import type { TutorResponse } from '../types';

// JSON-mode responses *should* be bare JSON, but be tolerant of stray
// prose or ```json fences so a slightly off-spec response still parses.

const FENCE_RE = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const m = FENCE_RE.exec(trimmed);
  return m && m[1] != null ? m[1] : trimmed;
}

function firstJsonBlock(raw: string): string {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return raw;
  return raw.slice(start, end + 1);
}

export type ParseResult =
  | { ok: true; response: TutorResponse }
  | { ok: false; error: string };

export function parseTutorResponse(raw: string): ParseResult {
  const candidate = firstJsonBlock(stripFences(raw));
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (err) {
    return { ok: false, error: `Response was not valid JSON: ${(err as Error).message}` };
  }
  const result = tutorResponseSchema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg = first ? `${first.path.join('.')}: ${first.message}` : 'schema validation failed';
    return { ok: false, error: `Response did not match the tutor schema (${msg})` };
  }
  return { ok: true, response: result.data };
}
