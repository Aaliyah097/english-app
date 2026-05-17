# S03 — Storage layer (localStorage, versioned, with export/import/reset)

**Phase:** 0 (foundation)
**Blocks:** 05, 06, 07, 10, 11
**Depends on:** 00, 02
**Parallel with:** 01, 04
**Estimated size:** S

## 1. Goal
Build a typed, versioned `localStorage` layer that owns every persisted entity (profile, checkpoint) and exposes `exportAll` / `importAll` / `resetAll` for Settings. All screen code reads and writes through this module and never touches `localStorage` directly.

> **Scope note:** vocabulary cards are out of MVP v1. **Do not** add vocabulary storage, eviction, or migration code. Skip the brief's 100-card stack entirely.

## 2. Context (read these first)
- Brief: [`ai/claude_code_mvp_brief.md`](../../ai/claude_code_mvp_brief.md) — "Architecture", "Settings Screen", "Export/import/reset". Ignore the "Vocabulary Card Model" section for v1.
- Schemas/types: `src/schemas.ts`, `src/types.ts` (S02). Note that `VocabularyCard` is intentionally absent in v1.

## 3. Inputs you can rely on
- `UserProfile`, `LearningCheckpoint`, the related Zod schemas (S02).

## 4. Outputs you must produce
A single barrel `src/storage/index.ts` exposing **only** these names:

```ts
// Per-entity getters/setters (synchronous, schema-validated on read)
getUserProfile(): UserProfile | null
setUserProfile(p: UserProfile): void

getCheckpoint(): LearningCheckpoint | null
setCheckpoint(c: LearningCheckpoint): void
mergeCheckpoint(patch: Partial<LearningCheckpoint>): LearningCheckpoint
// merge respects nested objects shallowly — see §5 step 3

// BYOK
getApiKey(): string | null
setApiKey(key: string | null): void  // null clears

// Whole-app
exportAll(): string             // JSON string, schema-validated
importAll(json: string): void   // throws on schema mismatch
resetAll(): void

// Reactivity for React screens (no external state library)
subscribe(listener: () => void): () => void
```

All persisted blobs live under namespaced keys:
- `englishly:v1:profile`
- `englishly:v1:checkpoint`
- `englishly:v1:apiKey` (note: kept out of `exportAll` / `importAll`)

## 5. Task breakdown
1. Internal helpers `readJson<T>(key, schema): T | null` and `writeJson(key, value)` — wraps `JSON.parse` in try/catch; runs Zod `safeParse`; returns `null` on miss or invalid.
2. Per-entity get/set functions, each typed and schema-validated.
3. `mergeCheckpoint`: shallow-merge top-level keys; for `currentLearningFocus` and `currentTopicProgress`, shallow-merge their inner objects too. Validate the result through the full schema before persisting.
4. `exportAll`: bundle `{ schemaVersion: 1, profile, checkpoint }`. **Do not include `apiKey`** — the user's API key never leaves the device.
5. `importAll`: parse JSON, validate against an "export envelope" schema (define it inline), then call the individual setters in order. If any step fails, no partial writes (compute the full new state first, then commit).
6. `resetAll`: remove all `englishly:v1:*` keys including `apiKey`. Confirm dialog is owned by S11, not here.
7. `subscribe`: minimal pub-sub. Every setter calls `notify()` after writing. Used by screens via a tiny hook `useStorageSnapshot(selector)` — implement it here so screens don't have to.
8. Tests (`src/storage/index.test.ts`):
   - Round-trip the profile through set → get.
   - Round-trip the checkpoint through set → get.
   - `mergeCheckpoint` preserves un-patched nested fields.
   - `exportAll` → `importAll` round-trip restores state.
   - `importAll` rejects malformed JSON without touching existing state.
   - `exportAll` does not include `apiKey`.
   - `resetAll` clears everything including `apiKey`.

## 6. Files to create or modify
- `src/storage/index.ts`
- `src/storage/keys.ts` (the namespaced key constants)
- `src/storage/useStorageSnapshot.ts`
- `src/storage/index.test.ts`

## 7. Acceptance criteria
- Every export listed in §4 exists, typed, and is the only public surface.
- No vocabulary-related code anywhere in `src/storage/`.
- No file outside `src/storage/` references `localStorage` directly (enforce via an ESLint `no-restricted-globals` rule scoped to `src/!(storage)/**`).
- Reading malformed data from `localStorage` returns `null`, never throws.
- `exportAll` output round-trips through `importAll`.
- Tests cover the cases in §5.8.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/storage
```

## 9. Out of scope
- Vocabulary storage (out of MVP v1).
- Settings UI (S11) — this story just provides the API.
- IndexedDB migration (post-MVP).
- Multi-device sync.
- Encrypting the API key at rest (localStorage is unencrypted; we accept this for BYOK and surface it in S11's UI).

## 10. Notes / open questions
None.
