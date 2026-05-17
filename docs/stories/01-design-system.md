# S01 — Design system port (theme, icons, primitives)

**Phase:** 0 (foundation)
**Blocks:** 05, 06, 07, 10, 11
**Depends on:** 00
**Parallel with:** 02, 03, 04 (touch entirely different folders)
**Estimated size:** M

## 1. Goal
Port the mockup's design tokens, icon set, and shared UI primitives into typed React/TS modules under `src/ui/` so every screen consumes the same components. Visual output must match the mockup pixel-for-pixel; the implementation switches from `window.*` globals to ES module imports.

## 2. Context (read these first)
- Tokens: [`ai/design/project/src/theme.js`](../../ai/design/project/src/theme.js) (whole file)
- Icons: [`ai/design/project/src/icons.jsx`](../../ai/design/project/src/icons.jsx) (whole file)
- Shell primitives: [`ai/design/project/src/shell.jsx`](../../ai/design/project/src/shell.jsx) (whole file — `Shell`, `TopBar`, `BottomNav`, `Chip`, `Btn`, `SectionTitle`)
- Practice-only primitives reused enough to share: `Bubble`, `TypingDot`, `InputDock` from [`ai/design/project/src/practice.jsx`](../../ai/design/project/src/practice.jsx)

## 3. Inputs you can rely on
- S00's scaffolding: TypeScript, React 19, ESLint, Vitest.

## 4. Outputs you must produce
Modules under `src/ui/`:

- `src/theme.ts` — exports `theme` (typed `Theme` interface). Same keys as `window.THEME`. Place at `src/` (not `src/ui/`) since types, storage, and AI may all read tokens for tone-related decisions.
- `src/ui/Icon.tsx` — exports `Icon` namespace object with all icons from the mockup. Each icon: `(props: { s?: number }) => JSX.Element`.
- `src/ui/Shell.tsx` — `<Shell>`, `<TopBar>`, `<SectionTitle>`.
- `src/ui/BottomNav.tsx` — `<BottomNav active onChange>` with the same four tabs.
- `src/ui/Chip.tsx` — `<Chip tone size>`.
- `src/ui/Btn.tsx` — `<Btn kind size full icon onClick>`.
- `src/ui/Bubble.tsx` — `<Bubble side pad>`.
- `src/ui/InputDock.tsx` — `<InputDock value onChange placeholder cta onSubmit>`.
- `src/ui/TypingDot.tsx` — `<TypingDot />`.
- `src/ui/index.ts` — barrel export.

## 5. Task breakdown
1. Create `src/theme.ts`. Type each token explicitly; use `as const` on the object. No runtime defaults — values are taken verbatim from `theme.js`.
2. Port icons one-to-one. Replace `currentColor` strokes unchanged; preserve `s` prop default (`18`, or `6` for `Dot`).
3. Port `Shell`, `TopBar`, `SectionTitle` from `shell.jsx`. Use `React.PropsWithChildren` where appropriate. Replace `window.THEME` with the imported `theme`.
4. Port `BottomNav` — tabs are `practice | progress | settings` (three tabs only; the `Vocabulary` tab from the mockup is scoped out of v1). `active` and `onChange` props typed against a `ScreenId` union (export the union from `src/ui/BottomNav.tsx` so S05 can import it).
5. Port `Chip`, `Btn` with the same tone/kind/size unions. Use discriminated string-union props, not loose strings.
6. Port `Bubble`, `TypingDot`, `InputDock` from `practice.jsx`. The `InputDock`'s submit button must call `onSubmit` on Enter as well as click.
7. Add render-smoke tests for `Btn`, `Chip`, `BottomNav` (clicking each tab calls `onChange` with the right id).
8. Add a Storybook-free visual sanity check: a dev-only route or playground page (`src/ui/__playground.tsx`) gated behind `import.meta.env.DEV` that renders every primitive once. Wire it into `App.tsx` only in dev mode.

## 6. Files to create or modify
- `src/theme.ts`
- `src/ui/Icon.tsx`
- `src/ui/Shell.tsx`
- `src/ui/BottomNav.tsx`
- `src/ui/Chip.tsx`
- `src/ui/Btn.tsx`
- `src/ui/Bubble.tsx`
- `src/ui/InputDock.tsx`
- `src/ui/TypingDot.tsx`
- `src/ui/index.ts`
- `src/ui/__playground.tsx`
- `src/ui/*.test.tsx` (at least the three listed above)
- `src/App.tsx` — wire the playground when `import.meta.env.DEV`

## 7. Acceptance criteria
- Every export listed in §4 exists with the documented signature.
- No `window.*` reads in any new file.
- All sizes, paddings, radii, colours match `theme.js` exactly (compare diff). Inline-style values may be expressed as numbers (px implicit) just like the mockup.
- `<BottomNav active="practice" onChange={…} />` highlights the Practice tab and calls `onChange('progress')` when the second tab is clicked.
- `<InputDock>` calls `onSubmit` on Enter and on send-button click.
- Playground renders in dev with no console errors.

## 8. Verification commands
```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run dev   # then visit / and confirm playground (dev only) renders
npm run build && npm run preview  # confirm playground is NOT included in prod build
```

## 9. Out of scope
- Screen-specific composites (`PracticeChat`, `Onboarding`, etc.) — owned by feature stories.
- Theme switching, dark mode.
- Animations beyond the simple transitions already in the mockup.
- Replacing inline styles with CSS modules / Tailwind.

## 10. Notes / open questions
- The mockup uses Newsreader (Google Fonts) + Geist + Geist Mono. Add the Google Fonts `<link>` tags to `index.html` (or self-host) as part of this story so primitives look correct in the playground.
