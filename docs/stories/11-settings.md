# S11 — Settings screen + BYOK + export/import/reset

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 02, 03
**Parallel with:** 05, 06, 07, 10
**Estimated size:** M

## 1. Goal
Implement the Settings screen end-to-end: edit topics + level, manage the DeepSeek API key (BYOK), and run the export / import / reset flows. This screen is the only place that touches the API key from a UI surface.

> **Scope note:** vocabulary cards are out of MVP v1. The export payload is profile + checkpoint only (per S03). Settings has no vocabulary-related controls.

## 2. Context (read these first)
- Mockup: [`ai/design/project/src/screens.jsx`](../../ai/design/project/src/screens.jsx) — find `SettingsScreen`.
- Brief: "Settings Screen", "Export/import/reset progress as JSON".
- Plan: [`docs/PLAN.md`](../PLAN.md) §1 — why BYOK exists and how to phrase it to the user.
- Storage (S03): `getUserProfile`, `setUserProfile`, `getApiKey`, `setApiKey`, `exportAll`, `importAll`, `resetAll`.

## 3. Inputs you can rely on
- UI primitives (S01).
- Storage (S03) — every settings action goes through it.
- Onboarding (S06) — reuse `StepInterests` and `StepLevel` step components if their public API allows (otherwise extract their shared bits into small helpers; coordinate with S06 if so).

## 4. Outputs you must produce
- `src/screens/settings/SettingsScreen.tsx`
- `src/screens/settings/ApiKeyPanel.tsx`
- `src/screens/settings/DataPanel.tsx` — export / import / reset.
- `src/screens/settings/EditProfilePanel.tsx` — topics + level + goal edits.
- Re-export `SettingsScreen` from `src/screens/index.ts`.

## 5. Task breakdown
1. Port `SettingsScreen` layout (sectioned list inside `<Shell>`).
2. `ApiKeyPanel`:
   - Show key status: "Not set" or a masked key (show only the last 4 chars; do not assume a specific prefix).
   - Inputs: password field + "Save" button. "Clear" button when a key exists.
   - Inline copy explaining: "Your DeepSeek API key is stored only on this device. Calls go directly to api.deepseek.com from your browser. We never see it. Get a key at platform.deepseek.com." Match design system tone (muted small text). The phrase "DeepSeek" is the **only** place in the UI codebase that names the provider — keep it scoped to this panel's copy.
   - On save: trim, then `setApiKey(trimmed)`. On clear: `setApiKey(null)` (confirm dialog first).
3. `EditProfilePanel`:
   - Topic chips identical to onboarding's `StepInterests`. Toggle calls `setUserProfile({...profile, interests: next})`.
   - Level select identical to `StepLevel`.
   - Goal select identical to `StepGoal`.
4. `DataPanel`:
   - **Export**: build a Blob from `exportAll()` and trigger a download named `englishly-export-YYYY-MM-DD.json`.
   - **Import**: file input → read text → `importAll(text)` → toast success or render the error inline (no global toast library; render an inline notice).
   - **Reset**: destructive button → confirm dialog → `resetAll()` → app returns to onboarding (S05 picks this up via storage `subscribe`).
5. Tests:
   - Saving an API key writes it via `setApiKey` (mocked).
   - Toggling a topic chip updates the profile in storage.
   - Export builds a JSON blob whose text round-trips through `importAll`.
   - Reset clears the profile (assert `getUserProfile()` returns `null` after).

## 6. Files to create or modify
- The four files in §4.
- `src/screens/settings/SettingsScreen.test.tsx`
- `src/screens/index.ts` re-export.
- Coordinate with S06 if extracting shared step bits — keep the diff in S06's files minimal (no behaviour change).

## 7. Acceptance criteria
- Each panel works without page reload.
- API-key inline copy clearly explains BYOK and links to the DeepSeek platform (`https://platform.deepseek.com`).
- Export file is valid JSON and re-importable on a fresh install.
- Reset returns the user to onboarding.
- No `localStorage` calls outside `src/storage`.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/screens/settings
```

## 9. Out of scope
- Editing native language (locked to onboarding choice in MVP).
- Multiple profiles / accounts.
- Cloud backup of the export file.
- Encrypted-at-rest API key.

## 10. Notes / open questions
- The mockup may show additional sections (theme, notifications) — ignore anything not in the brief's "Settings Screen" list.
