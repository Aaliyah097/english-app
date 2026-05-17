# Englishly — Development Plan

Local-first AI English tutor, published as a static SPA on **GitHub Pages**.
Source spec: [`ai/claude_code_mvp_brief.md`](../ai/claude_code_mvp_brief.md).
Mockup bundle (handoff from Claude Design): [`ai/design/`](../ai/design/).

> **MVP scope change (this revision):** vocabulary cards are **removed from v1**. The whole "save → review" loop and the Vocabulary tab are deferred to a later release. The brief still mentions cards; we treat that as out of scope until the user reopens it.

---

## 1. Constraint that drove the stack: GitHub Pages = static only

The brief recommended **Next.js with an API route** to hide the AI key.
GitHub Pages cannot run server code, so we cannot ship an API route.

Two ways to deal with this:

| Option | Pros | Cons |
|---|---|---|
| **A. BYOK** — user pastes their own DeepSeek API key into Settings, stored in `localStorage`. The browser calls the DeepSeek API directly via the OpenAI-compatible endpoint. | Pure static. No infra. Truly local-first. Zero ops cost. Fits "no DB" prototype scope. | User must have a DeepSeek key. Key sits in localStorage (acceptable for a personal-use tutor — flagged clearly in UI). |
| **B. Static frontend on GitHub Pages + serverless AI proxy** (Cloudflare Workers / Vercel) | Hides our key. | Splits hosting. Adds infra and cost. Couples deployment to a second platform. Out of MVP scope. |

**Decision: Option A (BYOK).** It is the only option that keeps the entire MVP on GitHub Pages without additional infrastructure, and it matches the local-first philosophy in the brief.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Smallest, fastest static-SPA toolchain. Built-in `base` option for GitHub Pages sub-path. |
| Framework | **React 19 + TypeScript** | Mockup is written in React JSX; preserves design fidelity with minimum translation. |
| Styling | **Inline styles + a typed `theme.ts` object** | Mirrors the mockup pattern 1:1 (mockup uses `window.THEME` + inline style objects). No Tailwind / CSS-in-JS overhead. |
| Persistence | **`localStorage`** behind a versioned wrapper | Brief allows localStorage or IndexedDB; without vocab we now hold only profile + checkpoint, well under the 5 MB limit. Versioned schema lets us migrate later. |
| AI provider | **DeepSeek** (`deepseek-chat`) via its OpenAI-compatible REST API at `https://api.deepseek.com/v1` | Cheap, fast, supports JSON-mode responses (`response_format: { type: 'json_object' }`) which we need for the tutor contract. |
| AI SDK | **`openai`** with `baseURL: 'https://api.deepseek.com/v1'` and `dangerouslyAllowBrowser: true` | DeepSeek is wire-compatible with the OpenAI Chat Completions API; the official `openai` SDK works against it by overriding `baseURL`. Avoids us hand-rolling HTTP + retries. |
| Validation | **Zod** | Required by brief for AI response validation. |
| Routing | **In-memory screen state** (like the prototype's `setScreen`) | Three screens (Practice / Progress / Settings) — no deep links needed for MVP. Avoids GitHub Pages SPA-routing friction. |
| Tests | **Vitest** + **@testing-library/react** | Vite-native, fast. |
| Lint/format | **ESLint** (flat config) + **Prettier** | Standard. |
| CI/CD | **GitHub Actions → `actions/deploy-pages`** | First-party GH Pages workflow. Deploy on push to `main`. |

### Repo layout

```
/
├─ ai/                          # spec + design bundle (source of truth, read-only)
│  ├─ claude_code_mvp_brief.md
│  └─ design/                   # extracted Claude Design handoff
├─ docs/
│  ├─ PLAN.md                   # this file
│  └─ stories/                  # one file per user story
├─ public/                      # static assets served as-is
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                   # screen-state container
│  ├─ theme.ts
│  ├─ types.ts                  # domain types
│  ├─ schemas.ts                # Zod schemas (mirror types.ts)
│  ├─ storage/                  # localStorage wrappers (profile + checkpoint only)
│  ├─ ai/                       # AI client (DeepSeek via OpenAI SDK) + prompt builder + parser
│  ├─ ui/                       # shared primitives (Btn, Chip, Bubble, Shell, TopBar, BottomNav, InputDock, Icon)
│  └─ screens/
│     ├─ onboarding/
│     ├─ practice/
│     ├─ progress/
│     └─ settings/
├─ .github/workflows/deploy.yml # GH Pages deploy
├─ vite.config.ts               # `base: '/<repo>/'`
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
| 00 | [Project scaffolding & GitHub Pages CI](./stories/00-scaffolding.md) | Nothing else runs without this. |
| 01 | [Design system port (theme, icons, primitives)](./stories/01-design-system.md) | Every screen imports these. |
| 02 | [Domain types & Zod schemas](./stories/02-types-and-schemas.md) | Shared contract for storage + AI + screens. |
| 03 | [Storage layer](./stories/03-storage-layer.md) | Every screen reads/writes through it. |
| 04 | [AI client](./stories/04-ai-client.md) | Practice consumes it. |

### Phase 1 — Features (parallelisable after Phase 0)

| # | Story | Depends on | Parallel group |
|---|---|---|---|
| 05 | [App shell & screen routing](./stories/05-app-shell.md) | 01, 03 | A |
| 06 | [Onboarding flow](./stories/06-onboarding.md) | 01, 02, 03 | A |
| 07 | [Practice screen (chat variant)](./stories/07-practice-chat.md) | 01, 02, 03, 04 | B |
| 10 | [Progress screen](./stories/10-progress-screen.md) | 01, 02, 03 | B |
| 11 | [Settings screen + BYOK + export/import/reset](./stories/11-settings.md) | 01, 02, 03 | B |

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
- **Storage API** — `src/storage/index.ts` exposes typed get/set/subscribe for the profile and checkpoint plus `exportAll()`, `importAll()`, `resetAll()`. Storage keys are namespaced and versioned.
- **AI client API** — `src/ai/client.ts` exposes `requestTutorTurn(input): Promise<TutorTurnResult>` which handles BYOK lookup, prompt building, JSON-mode invocation against DeepSeek, and Zod validation internally. Provider details (base URL, model id, key shape) live only inside `src/ai/`; the rest of the app never knows which provider is in use.
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
- [ ] App is reachable at `https://<user>.github.io/<repo>/` (00, 12).

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
