# Englishly — Development Plan

Local-first AI English tutor. Frontend ships as a Vite static SPA; AI traffic goes through a Vercel serverless function (`api/tutor.ts`) that holds the DeepSeek API key server-side.
Source spec: [`ai/claude_code_mvp_brief.md`](../ai/claude_code_mvp_brief.md).
Mockup bundle (handoff from Claude Design): [`ai/design/`](../ai/design/).

> **MVP scope change (vocab):** vocabulary cards are **removed from v1**. The whole "save → review" loop and the Vocabulary tab are deferred to a later release. The brief still mentions cards; we treat that as out of scope until the user reopens it.

> **MVP scope change (key custody):** earlier revisions used BYOK on GitHub Pages because GH Pages is static-only. We now serve our own key from a Vercel serverless function — the static bundle never contains it. Hosting moved off GitHub Pages to Vercel for this reason.

---

## 1. Hosting decision: Vercel (frontend + serverless function in one repo)

The brief recommended **Next.js with an API route** to hide the AI key. We use the same idea on a smaller stack:

| Layer | Where it runs | Holds the DeepSeek key? |
|---|---|---|
| Vite static SPA (the `dist/` output) | Vercel's static CDN | No |
| `api/tutor.ts` serverless function | Vercel Node runtime | Yes — read from `DEEPSEEK_API_KEY` env var |

Why Vercel over alternatives:
- **Cloudflare Workers** — would force splitting the deploy (Pages for the SPA, Workers for the function). Workable but more moving parts.
- **GitHub Pages + Cloudflare Workers** — same split, plus we'd lose the single `vercel dev` local-stack story.
- **Embedding the key in the static bundle** — never an option; the bundle is public.

The browser POSTs to `/api/tutor` with the structured tutor input (profile, checkpoint, current exercise, user answer). The function validates the input with the same Zod schemas the client uses, calls DeepSeek with the server-side key, validates the response against `tutorResponseSchema`, and returns it. No retry, no streaming, no auth in v1.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Smallest, fastest static-SPA toolchain. Vercel auto-detects it. |
| Framework | **React 19 + TypeScript** | Mockup is written in React JSX; preserves design fidelity with minimum translation. |
| Styling | **Inline styles + a typed `theme.ts` object** | Mirrors the mockup pattern 1:1 (mockup uses `window.THEME` + inline style objects). No Tailwind / CSS-in-JS overhead. |
| Persistence | **`localStorage`** behind a versioned wrapper | Brief allows localStorage or IndexedDB; without vocab we now hold only profile + checkpoint, well under the 5 MB limit. Versioned schema lets us migrate later. |
| AI provider | **DeepSeek** (`deepseek-chat`) via its OpenAI-compatible REST API at `https://api.deepseek.com/v1` | Cheap, fast, supports JSON-mode responses (`response_format: { type: 'json_object' }`) which we need for the tutor contract. |
| AI SDK (server-side only) | **`openai`** with `baseURL: 'https://api.deepseek.com/v1'` (no `dangerouslyAllowBrowser` — the SDK runs on the Vercel function, not in the browser) | DeepSeek is wire-compatible with the OpenAI Chat Completions API; the official `openai` SDK works against it by overriding `baseURL`. The browser only sees `fetch('/api/tutor')`. |
| CI | **GitHub Actions** runs typecheck / lint / test / build on push and PR | Vercel handles deploys via its GitHub integration — no deploy step in CI. |
| Validation | **Zod** | Required by brief for AI response validation. |
| Routing | **In-memory screen state** (like the prototype's `setScreen`) | Three screens (Practice / Progress / Settings) — no deep links needed for MVP. |
| Tests | **Vitest** + **@testing-library/react** | Vite-native, fast. |
| Lint/format | **ESLint** (flat config) + **Prettier** | Standard. |

### Repo layout

```
/
├─ ai/                          # spec + design bundle (source of truth, read-only)
│  ├─ claude_code_mvp_brief.md
│  └─ design/                   # extracted Claude Design handoff
├─ api/
│  └─ tutor.ts                  # Vercel serverless function — calls DeepSeek
├─ docs/
│  ├─ PLAN.md                   # this file
│  └─ stories/                  # one file per user story
├─ public/                      # static assets served as-is
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                   # screen-state container
│  ├─ theme.ts
│  ├─ types.ts                  # domain types
│  ├─ schemas.ts                # Zod schemas (mirror types.ts) — shared with api/
│  ├─ storage/                  # localStorage wrappers (profile + checkpoint only)
│  ├─ ai/                       # client wrapper: fetch('/api/tutor') + Zod validation
│  ├─ ui/                       # shared primitives
│  └─ screens/
│     ├─ onboarding/
│     ├─ practice/
│     ├─ progress/
│     └─ settings/
├─ .github/workflows/ci.yml     # CI only (typecheck/lint/test/build); Vercel deploys
├─ vercel.json                  # framework: vite, outputDirectory: dist
├─ vite.config.ts
├─ index.html
├─ package.json
└─ tsconfig.json
```

---

## 3. Practice-variant decision

The mockup ships **three** practice layouts (chat / cards / split). The MVP brief only asks for one working flow.

**Ship the chat variant first** (`PracticeChat`). It is the canonical layout in the mockup canvas and has the richest correction UI (inline diff). The other two variants are out of scope for MVP and tracked as post-MVP follow-ups.

---

## 4. How the stories are organised

The MVP is split into 11 stories grouped into three phases. Each story lives in its own file in [`docs/stories/`](./stories/) and follows the same structure (see [`stories/STORY_TEMPLATE.md`](./stories/STORY_TEMPLATE.md)).

### Phase 0 — Foundation (sequential, blocks everything)

| # | Story | Why first |
|---|---|---|
| 00 | [Project scaffolding & CI](./stories/00-scaffolding.md) | Nothing else runs without this. |
| 01 | [Design system port (theme, icons, primitives)](./stories/01-design-system.md) | Every screen imports these. |
| 02 | [Domain types & Zod schemas](./stories/02-types-and-schemas.md) | Shared contract for storage + AI + screens. |
| 03 | [Storage layer](./stories/03-storage-layer.md) | Every screen reads/writes through it. |
| 04 | [AI proxy (client + Vercel function)](./stories/04-ai-proxy.md) | Practice consumes it; the server function holds the key. |

### Phase 1 — Features (parallelisable after Phase 0)

| # | Story | Depends on | Parallel group |
|---|---|---|---|
| 05 | [App shell & screen routing](./stories/05-app-shell.md) | 01, 03 | A |
| 06 | [Onboarding flow](./stories/06-onboarding.md) | 01, 02, 03 | A |
| 07 | [Practice screen (chat variant)](./stories/07-practice-chat.md) | 01, 02, 03, 04 | B |
| 10 | [Progress screen](./stories/10-progress-screen.md) | 01, 02, 03 | B |
| 11 | [Settings screen (Edit Profile + Data)](./stories/11-settings.md) | 01, 02, 03 | B |

Parallel groups can be dispatched simultaneously to independent agents:
- **Group A** (5, 6) once Phase 0 lands.
- **Group B** (7, 10, 11) once Phase 0 lands. Independent of Group A because they only touch their own screen folder + the shared interfaces from Phase 0.

> Story numbers 08 (Vocabulary screen) and 09 (Vocabulary review) were removed when vocabulary cards left the MVP scope. The gap in the numbering is intentional — it reserves the IDs for when those features return.

### Phase 2 — Ship

| # | Story | Depends on |
|---|---|---|
| 12 | [End-to-end smoke test & deploy](./stories/12-e2e-and-deploy.md) | All of Phase 1 |

---

## 5. Cross-cutting contracts (frozen in Phase 0)

These are the seams between stories — once Phase 0 is merged, parallel feature stories may only **consume** these interfaces, never modify them. Changes require a co-ordinated edit across stories.

- **Types** — exported from [`src/types.ts`](../src/types.ts): `UserProfile`, `LearningCheckpoint`, `Mistake`, `Exercise`, `TutorResponse`. Schema mirrors live in [`src/schemas.ts`](../src/schemas.ts). **`VocabularyCard` is intentionally absent in v1.**
- **Storage API** — `src/storage/index.ts` exposes typed get/set/subscribe for the profile and checkpoint plus `exportAll()`, `importAll()`, `resetAll()`. Storage keys are namespaced and versioned. No `apiKey` — the key lives on the server.
- **AI client API** — `src/ai/index.ts` exposes `requestTutorTurn(input): Promise<TutorTurnResult>` which `POST`s to `/api/tutor` and validates the response against `tutorResponseSchema`. The OpenAI SDK lives only in `api/tutor.ts`; the browser bundle does not contain it.
- **UI primitives** — `src/ui/*` exports `Shell`, `TopBar`, `BottomNav` (3 tabs — Practice / Progress / Settings), `Btn`, `Chip`, `Icon`, `Bubble`, `InputDock`, `SectionTitle`.
- **Screen routing** — `App.tsx` owns a `screen` state machine: `'onboarding' | 'practice' | 'progress' | 'settings'`. Each screen is a self-contained component receiving no props beyond callbacks.

---

## 6. Acceptance for the whole MVP

Mirrors the brief (with vocabulary scoped out), restated as a build-time checklist:

- [ ] User can complete 5-step onboarding (06).
- [ ] User can practice translation exercises (07).
- [ ] AI corrects answer and explains mistakes shortly (07).
- [ ] AI generates next exercise (07).
- [ ] Checkpoint persists after page reload (03, 07).
- [ ] Progress and settings screens work (10, 11).
- [ ] Export/import/reset progress works (11).
- [ ] No database required (03).
- [ ] UI follows the provided mockups (01 + every screen story).
- [ ] App is reachable at `https://<project>.vercel.app/` (00, 12).

---

## 7. Non-goals for MVP (do not build)

From the brief plus this revision, restated so agents do not drift:

- **Vocabulary cards in any form** — no extraction during practice, no deck, no review screen, no Vocabulary tab in the bottom nav, no `vocabularyCardsToAdd` in the AI response, no card-related types in storage. The mockup's `NewCardsRow` and "Saved to your deck" UI are skipped. Deferred to a later release.
- Auth, accounts, server database, payments.
- Admin panel, teacher dashboard, social features.
- Cards/split practice variants (post-MVP).
- Native mobile app, speech evaluation, mic input.
- Spaced repetition.
- Detailed analytics dashboards.
