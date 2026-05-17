// Vercel serverless function: holds the DeepSeek API key server-side so it
// never ships in the browser bundle. The frontend POSTs a structured tutor
// turn input here; we build the prompt, call DeepSeek, validate the JSON
// against the same Zod schema the client uses, and forward the result.
//
// Env vars required (set in Vercel project settings):
//   DEEPSEEK_API_KEY  — the server-side key
//   DEEPSEEK_MODEL    — optional; defaults to 'deepseek-chat'

import OpenAI from 'openai';
import {
  exerciseSchema,
  learningCheckpointSchema,
  tutorResponseSchema,
  userProfileSchema,
} from '../src/schemas';

export const config = {
  runtime: 'nodejs',
};

const PROVIDER_BASE_URL = 'https://api.deepseek.com/v1';

import { z } from 'zod';

const requestSchema = z.object({
  userProfile: userProfileSchema,
  checkpoint: learningCheckpointSchema,
  currentExercise: exerciseSchema,
  userAnswer: z.string(),
});

type Req = z.infer<typeof requestSchema>;

function buildSystemPrompt(profile: Req['userProfile']): string {
  return [
    'You are an AI English tutor.',
    `The user's native language is "${profile.nativeLanguage}". They are practising "${profile.targetLanguage}" at level "${profile.level}".`,
    `Their goal: ${profile.goal}.`,
    'The user translates short sentences from their native language into English.',
    'Focus on tenses, conditionals, articles, prepositions, and natural conversational English.',
    '',
    'Keep explanations short and practical. Do not give long theory.',
    'Correct mistakes clearly. Suggest a more natural alternative only when useful.',
    'Update the checkpoint compactly — only fields that actually changed.',
    'Generate the next exercise based on the topic, current grammar focus, level, and repeated mistakes.',
    '',
    'Return JSON ONLY with this exact shape (no markdown fences, no prose):',
    '{',
    '  "messageToUser": string,',
    '  "correctedAnswer": string,         // the corrected English sentence',
    '  "updatedCheckpoint": {              // include only fields that changed; omit the rest',
    '    "currentLearningFocus"?:   { "grammarTopic": string, "sentenceType"?: string, "difficulty": number /*1-5*/ },',
    '    "recentMistakes"?:         [ { "type": string, "example": string, "correction": string, "explanation"?: string } ],',
    '    "completedTopics"?:        [ string ],',
    '    "currentTopicProgress"?:   { "topic": string, "completedExercises": number, "knownWeaknesses": [ string ] },',
    '    "lastCheckpointSummary"?:  string',
    '  },',
    '  "nextExercise": {',
    '    "sourceLanguage": string, "targetLanguage": string,',
    '    "sentence": string, "grammarTopic": string, "difficulty": number /*1-5*/',
    '  }',
    '}',
    '',
    'recentMistakes MUST be an array of objects with the four named fields — never an array of strings.',
    'difficulty MUST be an integer in [1, 5].',
  ].join('\n');
}

function buildUserPrompt(req: Req): string {
  const sections: Array<[string, unknown]> = [
    ['USER_PROFILE', req.userProfile],
    ['CHECKPOINT', req.checkpoint],
    ['CURRENT_EXERCISE', req.currentExercise],
    ['USER_ANSWER', req.userAnswer],
  ];
  return sections
    .map(([label, value]) => `# ${label}\n${JSON.stringify(value, null, 2)}`)
    .join('\n\n');
}

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return json({ error: 'Server misconfigured: DEEPSEEK_API_KEY not set' }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body must be valid JSON' }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: `Bad request: ${parsed.error.issues[0]?.message ?? 'schema mismatch'}` },
      400,
    );
  }

  const client = new OpenAI({ apiKey: key, baseURL: PROVIDER_BASE_URL });
  const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        { role: 'system', content: buildSystemPrompt(parsed.data.userProfile) },
        { role: 'user', content: buildUserPrompt(parsed.data) },
      ],
    });
  } catch (err) {
    return json({ error: `Upstream error: ${(err as Error).message}` }, 502);
  }

  const raw = completion.choices[0]?.message?.content ?? '';
  let aiObj: unknown;
  try {
    aiObj = JSON.parse(firstJsonBlock(stripFences(raw)));
  } catch (err) {
    return json(
      { error: `Upstream returned non-JSON: ${(err as Error).message}`, raw },
      502,
    );
  }

  const validated = tutorResponseSchema.safeParse(aiObj);
  if (!validated.success) {
    return json(
      {
        error: `Upstream JSON did not match schema (${validated.error.issues[0]?.path.join('.') ?? '?'}: ${validated.error.issues[0]?.message ?? '?'})`,
        raw,
      },
      502,
    );
  }

  return json(validated.data, 200);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
