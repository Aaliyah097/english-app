# Story Template

Every story file follows this shape. The structure is optimised for dispatching one self-contained brief to a coding agent that has **not** seen the rest of the conversation.

```
# S<NN> — <Title>

**Phase:** 0 (foundation) | 1 (feature) | 2 (ship)
**Blocks:** which stories cannot start until this one merges
**Depends on:** stories that must merge first
**Parallel with:** stories that can run at the same time without conflict
**Estimated size:** S | M | L

## 1. Goal
One or two sentences. What does done look like?

## 2. Context (read these first)
- Brief section(s): `ai/claude_code_mvp_brief.md` lines …
- Mockup file(s): `ai/design/project/src/<file>.jsx` lines …
- Other stories: links

## 3. Inputs you can rely on
Modules/types/components produced by upstream stories. Quote the exact exports — the agent should not have to discover them.

## 4. Outputs you must produce
Public API of this story: exported types, functions, components, files. Other stories will consume **only these names**. If you need to widen the surface, update the consumers' stories too.

## 5. Task breakdown
Ordered, concrete sub-tasks. Each should be small enough to map to one commit.

## 6. Files to create or modify
Explicit paths. Anything not listed here is out of scope.

## 7. Acceptance criteria
Bulleted, verifiable. Each item must be falsifiable by reading code or running a command.

## 8. Verification commands
Exact commands the agent runs before declaring done. At minimum: typecheck, lint, test, build.

## 9. Out of scope
Anything an enthusiastic agent might add but shouldn't.

## 10. Notes / open questions
Only if anything is genuinely unresolved. Default empty.
```

## Conventions used across all stories

- **Paths** are relative to the repo root.
- **"Mockup"** = the React JSX files under `ai/design/project/src/`. Treat them as the visual source of truth; port pixel-for-pixel but in TypeScript and as ES modules, not browser globals.
- **No `window.*` globals.** The mockup writes everything to `window`; the implementation must use real ES module imports.
- **No new dependencies** beyond those listed in story S00 unless the story explicitly says so.
- **Tests are required** for every module under `src/storage/`, `src/ai/`, and any pure helper. Screens get one happy-path render test each.
- **Commits**: one logical change per commit, conventional-commits style (`feat(practice): …`). Keep each story to ≤10 commits.
- **Definition of done**: acceptance criteria met **and** verification commands pass **and** no TODOs left in changed files.
