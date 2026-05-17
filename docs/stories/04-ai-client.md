# S04 — AI client (DeepSeek via OpenAI SDK, BYOK, prompt builder, validated parser)

**Phase:** 0 (foundation)
**Blocks:** 07
**Depends on:** 00, 02, 03
**Parallel with:** 01
**Estimated size:** M

## 1. Goal
Provide a single typed entry point that the Practice screen calls to get the next tutor turn. The module reads the BYOK key from storage, builds the system + user prompt per the brief, calls **DeepSeek** via its OpenAI-compatible REST endpoint, parses the JSON response, and validates it against `tutorResponseSchema`. All AI-related complexity — provider identity included — lives here.

> **Scope note (v1):** vocabulary cards are out of MVP v1. **Do not** expose a `checkReviewAnswer` function and **do not** include a `vocabularySummary` in the prompt input. The system prompt must not ask the model to extract vocabulary.

> **Provider note:** the rest of the app must never reference DeepSeek by name or know which provider is in use. The provider seam is `src/ai/`. Swapping providers later (e.g. back to Anthropic, or to OpenAI proper) is a one-file change inside this folder.

## 2. Context (read these first)
- Brief: [`ai/claude_code_mvp_brief.md`](../../ai/claude_code_mvp_brief.md) — "AI Response Contract", "AI Tutor Behavior", "Main Practice Flow" (sections 5–7). Ignore bullets mentioning vocabulary and any specific provider — those are decisions overridden by this plan.
- Schemas: `src/schemas.ts` — `tutorResponseSchema`, related types (S02). v1 `TutorResponse` has no `vocabularyCardsToAdd`.
- Storage: `src/storage/index.ts` — `getApiKey`, `getUserProfile`, `getCheckpoint` (S03).
- DeepSeek API reference: `https://api-docs.deepseek.com/` — it implements the OpenAI Chat Completions interface at `https://api.deepseek.com/v1`. Models: `deepseek-chat` (general) and `deepseek-reasoner` (reasoning). Supports `response_format: { type: 'json_object' }`.

## 3. Inputs you can rely on
- `getApiKey`, `getUserProfile`, `getCheckpoint` from `src/storage`.
- `tutorResponseSchema`, `Exercise`, `LearningCheckpoint`, `UserProfile` from `src/schemas` and `src/types`.
- `openai` is already in `package.json` (S00).

## 4. Outputs you must produce
`src/ai/index.ts` exports:

```ts
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

export async function requestTutorTurn(input: TutorTurnInput): Promise<TutorTurnResult>;

// Centralised so we change them in one place.
export const DEFAULT_MODEL = 'deepseek-chat';
export const PROVIDER_BASE_URL = 'https://api.deepseek.com/v1';
```

Internal modules (not exported from the barrel):
- `src/ai/client.ts` — OpenAI SDK instantiation pointed at DeepSeek, `dangerouslyAllowBrowser: true`.
- `src/ai/prompts.ts` — system prompt + user-prompt builders (returns plain strings).
- `src/ai/parse.ts` — JSON extraction (tolerant of ```json fences and stray prose, even though we ask for JSON mode) and Zod validation.

## 5. Task breakdown
1. **Client**: factory `getAiClient(): OpenAI | null`. Reads key via `getApiKey()`. Returns `null` if no key. Construct as:
   ```ts
   new OpenAI({
     apiKey,
     baseURL: PROVIDER_BASE_URL,
     dangerouslyAllowBrowser: true,
   });
   ```
   Cache the instance keyed by the API-key string so changing keys re-instantiates.
2. **System prompt**: adapt the brief's "AI Tutor Behavior" block, **omitting the vocabulary bullets**. Parametrise the line about target/native language from the profile. Tell the model to focus on tenses, conditionals, articles, prepositions, and natural conversational English. Add a strict footer: "Return JSON only with `messageToUser`, `correctedAnswer`, `updatedCheckpoint`, `nextExercise`. No prose. No markdown fences."
3. **User prompt builder** for `requestTutorTurn`: serialise the input as a small JSON block under labelled sections (`USER_PROFILE`, `CHECKPOINT`, `CURRENT_EXERCISE`, `USER_ANSWER`). Keep it compact (brief: checkpoint must be small enough to pass on every request).
4. **Parser**: `parseTutorResponse(raw): TutorResponse | { error: string }`. Strip ```json fences as a defence-in-depth (JSON mode should make this unnecessary, but cheap to keep), attempt `JSON.parse`, then `tutorResponseSchema.safeParse`. On either failure, return `{ error }` with a useful message.
5. **`requestTutorTurn`**: orchestrate
   ```ts
   client.chat.completions.create({
     model: DEFAULT_MODEL,
     messages: [
       { role: 'system', content: systemPrompt },
       { role: 'user',   content: userPrompt },
     ],
     response_format: { type: 'json_object' },
     temperature: 0.4,
   })
   ```
   then parse → return tagged union. Single turn, no streaming.
6. **Tests** (`src/ai/parse.test.ts`, `src/ai/prompts.test.ts`, `src/ai/index.test.ts`):
   - Parser handles bare JSON, fenced JSON, and prose-wrapped JSON.
   - Parser rejects schema mismatches with a non-empty error string.
   - Prompt builders produce stable snapshots given fixed input.
   - Prompt does **not** contain the words "vocabulary" or "card" (regression guard for v1 scope).
   - `requestTutorTurn` returns `{ kind: 'no-key' }` when storage has no key (mock `getApiKey`).
   - With the SDK's `chat.completions.create` mocked, the call is made with `model: 'deepseek-chat'`, `baseURL: 'https://api.deepseek.com/v1'`, and `response_format: { type: 'json_object' }`. Assert each.
   - All four tagged-union result branches are reachable via mocked SDK responses (ok / 5xx / malformed JSON / no-key).
   - **Do not** add an integration test against the real API.
7. Add a tiny in-module note (one short comment) at the top of `client.ts` explaining the BYOK + `dangerouslyAllowBrowser` decision **and** the DeepSeek-via-OpenAI-SDK choice, linking to `docs/PLAN.md`.

## 6. Files to create or modify
- `src/ai/index.ts`
- `src/ai/client.ts`
- `src/ai/prompts.ts`
- `src/ai/parse.ts`
- `src/ai/parse.test.ts`
- `src/ai/prompts.test.ts`
- `src/ai/index.test.ts`

## 7. Acceptance criteria
- Every export listed in §4 exists with the documented signature.
- No `checkReviewAnswer` export. No `vocabularySummary` in `TutorTurnInput`.
- The generated system + user prompts contain no mention of vocabulary or cards (asserted by test).
- The OpenAI SDK is instantiated with `baseURL: 'https://api.deepseek.com/v1'` and `dangerouslyAllowBrowser: true` (asserted by test).
- No file outside `src/ai/` imports `openai` directly.
- No file outside `src/ai/` contains the strings `deepseek` or `api.deepseek.com` (asserted by an ESLint `no-restricted-syntax` rule or a one-off Vitest test that greps `src/`).
- `requestTutorTurn` never throws; it always resolves to a tagged-union result.
- All four tagged-union branches reachable in tests.
- Model id and base URL are centralised in `DEFAULT_MODEL` / `PROVIDER_BASE_URL`.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/ai
```

## 9. Out of scope
- Vocabulary-card extraction or review checking (out of MVP v1).
- Streaming responses.
- Provider auto-detect or per-request override.
- Server-side proxy (rejected — see `docs/PLAN.md` §1).
- Retry / exponential backoff. A single network call per turn is fine for MVP; surface the error to the UI.

## 10. Notes / open questions
- DeepSeek's JSON mode does **not** guarantee schema conformance — only valid JSON. Schema validation via Zod is still required.
- `temperature: 0.4` is a reasonable default for a tutor (consistent corrections, mild variety in next-exercise generation). Tune in dev if responses feel mechanical.
- If we later want to support multiple providers, the cleanest extension is to add a `Provider` interface inside `src/ai/` and pick at instantiation; v1 keeps the single hard-coded provider.
