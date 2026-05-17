# S11 — Settings screen (Edit Profile + Data)

**Phase:** 1 (feature)
**Blocks:** 12
**Depends on:** 01, 02, 03
**Parallel with:** 05, 06, 07, 10
**Estimated size:** S

> **Revision note:** the original Settings story had three panels including a BYOK ApiKeyPanel. Since the DeepSeek key now lives on the server (`api/tutor.ts`), the ApiKeyPanel has been removed entirely. Settings ships with two panels: Edit Profile and Data.

## 1. Goal
Implement the Settings screen: let the user edit their topics/level/goal, and run the export / import / reset flows. No API key, no AI calls.

> **Scope note:** vocabulary cards are out of MVP v1. The export payload is profile + checkpoint only. Settings has no vocabulary-related controls.

## 2. Context (read these first)
- Mockup: [`ai/design/project/src/screens.jsx`](../../ai/design/project/src/screens.jsx) — find `SettingsScreen`. Skip any API-key controls and any sections not listed in the brief.
- Brief: [`ai/claude_code_mvp_brief.md`](../../ai/claude_code_mvp_brief.md) "Settings Screen".
- Plan: [`docs/PLAN.md`](../PLAN.md) §1 (why the key lives server-side).
- Storage (S03): `getUserProfile`, `setUserProfile`, `exportAll`, `importAll`, `resetAll`, `useStorageSnapshot`. There is no `getApiKey`/`setApiKey`.
- Onboarding (S06): reuse `src/screens/onboarding/options.ts` for the topic/level/goal option lists.

## 3. Inputs you can rely on
- UI primitives (S01).
- Storage (S03).
- Onboarding options module.

## 4. Outputs you must produce
- `src/screens/settings/SettingsScreen.tsx` — composes `EditProfilePanel` + `DataPanel` inside `<Shell><TopBar title="Settings" />`.
- `src/screens/settings/EditProfilePanel.tsx`
- `src/screens/settings/DataPanel.tsx`
- `src/screens/settings/SettingsScreen.test.tsx`

## 5. Task breakdown
1. **EditProfilePanel** — reactive read via `useStorageSnapshot(getUserProfile)` (with a stable selector that caches by JSON identity). Interests as chips, level as radio-style buttons, goal as radio-style buttons. Each toggle writes back via `setUserProfile({...current, …patch})`. Renders nothing when no profile (Settings is unreachable in that case anyway).
2. **DataPanel** —
   - **Export**: build a `Blob` from `exportAll()`, trigger download via a transient `<a>` (`download = "englishly-export-YYYY-MM-DD.json"`). Revoke the object URL after.
   - **Import**: hidden `<input type="file" accept="application/json">` triggered by a visible button. Read via `FileReader` (jsdom's `File.text()` returns `undefined`, so don't use it). On success show "Import successful." inline. On failure show the error inline.
   - **Reset**: destructive button → `window.confirm(...)` → `resetAll()`. The app shell's `useStorageSnapshot` routes the user back to onboarding.
3. Tests (mock `window.confirm` to return true; seed a profile in `beforeEach`):
   - Toggling an interest chip updates the stored profile.
   - Export builds a JSON string whose text round-trips through `importAll` (after wiping, the profile re-appears).
   - Reset (confirmed) clears the profile.

## 6. Files to create or modify
- The four files in §4.
- `src/screens/index.ts` — `SettingsScreen` export.

## 7. Acceptance criteria
- No vocabulary anywhere; no API-key controls anywhere.
- No `localStorage` access outside `src/storage`.
- Reset returns the user to onboarding via the app-shell gating.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run src/screens/settings
```

## 9. Out of scope
- Editing native language (locked to onboarding choice in MVP).
- Multiple profiles / accounts.
- Cloud backup.
- API-key controls (the server holds the key).
