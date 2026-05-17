# S04 — AI proxy: client fetch + Vercel serverless function

**Phase:** 0 (foundation)
**Blocks:** 07
**Depends on:** 00, 02, 03
**Parallel with:** 01
**Estimated size:** M

> **Revision note:** earlier revisions of this story used BYOK from the browser via the OpenAI SDK with `dangerouslyAllowBrowser`. We now hold the key server-side in a Vercel serverless function (`api/tutor.ts`). The browser never sees the DeepSeek key. See `docs/PLAN.md` §1.

## 1. Goal
Two cooperating pieces, kept in one story because the contract between them is the seam:

1. **`api/tutor.ts`** — a Vercel serverless function. Receives a `TutorTurnInput`, builds the prompt, calls DeepSeek via the `openai` SDK with the server's API key, validates the response with Zod, returns `TutorResponse` JSON or a structured error.
2. **`src/ai/index.ts`** — a thin browser client. `requestTutorTurn(input)` POSTs to `/api/tutor`, runs the response through `tutorResponseSchema`, and returns a tagged-union result. Never imports the OpenAI SDK, never knows DeepSeek exists.

> **Scope note (v1):** vocabulary cards are out of MVP v1. The prompt does not ask the model to extract vocabulary; the response schema has no `vocabularyCardsToAdd`.

## 2. Context (read these first)
- Brief: [`ai/claude_code_mvp_brief.md`](../../ai/claude_code_mvp_brief.md) — "AI Response Contract", "AI Tutor Behavior", "Main Practice Flow" (sections 5–7). Ignore the BYOK-shaped advice and the vocabulary bullets.
- Schemas: `src/schemas.ts` — `tutorResponseSchema` etc. (S02). Server and client both import these; the schema is the canonical contract.
- DeepSeek API reference: `https://api-docs.deepseek.com/` — OpenAI-compatible Chat Completions at `https://api.deepseek.com/v1`. JSON mode via `response_format: { type: 'json_object' }`. Default model `deepseek-chat`.

## 3. Inputs you can rely on
- Schemas/types from S02 (`userProfileSchema`, `learningCheckpointSchema`, `exerciseSchema`, `tutorResponseSchema`).
- `openai` and `zod` dependencies (already in `package.json`).
- `@types/node` for the Vercel function build.

## 4. Outputs you must produce

### Browser side (`src/ai/index.ts`)

```ts
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

export async function requestTutorTurn(input: TutorTurnInput): Promise<TutorTurnResult>;
```

Notes:
- No `'no-key'` branch — the key lives on the server, not the client.
- Non-2xx responses become `network-error` (carrying the server's `error` string when present).
- Schema-validation failures become `invalid-response`.

### Server side (`api/tutor.ts`)

- Default export: `async function handler(req: Request): Promise<Response>`.
- `export const config = { runtime: 'nodejs' }` (Vercel function config; web-standard Request/Response API).
- Reads `process.env.DEEPSEEK_API_KEY` (required) and `process.env.DEEPSEEK_MODEL` (optional, defaults to `deepseek-chat`).
- Validates the request body with a Zod schema derived from the input shape — bad request → 400.
- Calls DeepSeek with JSON mode; parses + validates response; on schema mismatch → 502 with a useful `error` and the `raw` payload for debugging.
- Returns the validated `TutorResponse` on success (200).

### Build config
- `tsconfig.api.json` — separate tsconfig that includes `api/` and `src/schemas.ts` + `src/types.ts`, with `types: ['node']`.
- `vercel.json` — `{ "framework": "vite", "outputDirectory": "dist" }`.

## 5. Task breakdown
1. Add `vercel.json`.
2. Write `api/tutor.ts` per §4. Inline the prompt-builders (system + user) — they're only used here.
3. Write `src/ai/index.ts` as the fetch-based client.
4. Add `tsconfig.api.json` and reference it from root `tsconfig.json`.
5. Add `@types/node` to `devDependencies`.
6. Tests (`src/ai/index.test.ts`): mock `globalThis.fetch`. Cover:
   - POSTs to `/api/tutor` with the input as JSON body.
   - Returns `{kind:'ok'}` on a valid payload.
   - Returns `{kind:'network-error'}` when `fetch` rejects.
   - Returns `{kind:'network-error'}` when the response is non-2xx (passes through the server's `error` message).
   - Returns `{kind:'invalid-response'}` when the body doesn't match `tutorResponseSchema`.
7. (Out of scope for this MVP cut) Server-side unit tests for `api/tutor.ts`. The serverless function is integration-tested in S12.

## 6. Files to create or modify
- `api/tutor.ts`
- `vercel.json`
- `src/ai/index.ts`
- `src/ai/index.test.ts`
- `tsconfig.json`, `tsconfig.api.json`
- `package.json` (add `@types/node`)

## 7. Acceptance criteria
- The browser bundle does **not** import `openai` (verify by `grep -r openai dist/` after build — zero matches).
- `requestTutorTurn` never throws; always resolves to a tagged-union result.
- `api/tutor.ts` returns 400 on malformed input, 500 if the env var is missing, 502 on upstream/schema failure, 200 on success.
- Default model is `deepseek-chat`; overridable via `DEEPSEEK_MODEL`.
- No file outside `api/` references `openai`.
- No file outside `api/` references `api.deepseek.com` (the URL is hard-coded only there).

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/ai
npm run build && grep -c "api.deepseek.com" dist/assets/*.js   # expect 0
```

For end-to-end manual verification, run `vercel dev` locally (requires `npm i -g vercel` and a `.env.local` with `DEEPSEEK_API_KEY=…`) and POST a real input to `http://localhost:3000/api/tutor`.

## 9. Out of scope
- Streaming responses.
- Retry / exponential backoff.
- Auth / rate limiting (deferred — see PLAN §1).
- Multi-provider abstraction.

## 10. Notes / open questions
- DeepSeek's JSON mode guarantees valid JSON, not schema conformance — Zod still required.
- `temperature: 0.4` is a reasonable default for tutor consistency.
