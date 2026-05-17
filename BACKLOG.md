# Backlog

Post-MVP features and improvements. Add new items as we go; promote into stories when ready to build.

## Adaptive learning

- [ ] **Classify user error types to reduce repeats.** Today every mistake is recorded as a free-text `Mistake` (`type`, `example`, `correction`, `explanation?`). The AI is asked to weight future exercises toward known weaknesses, but the bookkeeping is loose and prone to drift. Tighten it so repeats actually drop over time. Possible shape:
  - Define a small closed vocabulary of mistake categories (e.g. `third-person-s`, `article-zero/the/a`, `tense-present-vs-past`, `preposition-in/on/at`, `word-order`, `false-friend`, `collocation`). Persist them as an enum in the schema.
  - On every turn, ask the AI to tag each `Mistake.type` with one of those categories (plus `other` for fallback). Validate strictly — unknown categories become `other` and surface in logs.
  - Aggregate per-category counts in the checkpoint (`mistakesByCategory: Record<Category, number>`); pass the top-N back to the model on the next turn with a "focus next exercise on these patterns" instruction.
  - UX: surface the top 3 in the Progress screen as a "common slips" section.
  - Validation: track whether per-category counts trend down after they appear in the top-N — if they don't, the loop isn't working and we tune the prompt.
