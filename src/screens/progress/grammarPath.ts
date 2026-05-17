// Canonical 13-item grammar path from ai/claude_code_mvp_brief.md "Learning Path".
// This list is the source of truth for the Progress screen and any future
// settings UI that lets the learner jump topics.

export const GRAMMAR_PATH = [
  'Present Simple',
  'Present Continuous',
  'Past Simple',
  'Future Simple',
  'Present Perfect',
  'Present Perfect vs Past Simple',
  'Past Continuous',
  'Compound sentences',
  'Complex sentences',
  'Conditionals',
  'Passive voice',
  'Relative clauses',
  'Advanced explanations and trade-offs',
] as const;

export type GrammarTopic = (typeof GRAMMAR_PATH)[number];

export type GrammarPathState = 'completed' | 'current' | 'upcoming' | 'locked';

export type TaggedTopic = {
  name: string;
  state: GrammarPathState;
};

// Pragmatic simplification (per S10 brief): we don't model formal stage
// boundaries yet. A topic more than 4 positions past the current one is
// treated as "locked" so the UI can hint at the gating without us having
// to track stages explicitly.
const LOCK_DISTANCE = 4;

/**
 * Tags every topic in the canonical grammar path with its state, given the
 * checkpoint's `completedTopics` and `currentLearningFocus.grammarTopic`.
 *
 * Rules:
 *   - Topic name appears in `completed` → 'completed'.
 *   - The first non-completed topic that matches `currentTopic` → 'current'.
 *   - Non-completed topics before the current marker → 'upcoming' (the user
 *     can backtrack to them).
 *   - Non-completed topics within LOCK_DISTANCE of current → 'upcoming'.
 *   - Anything further out → 'locked'.
 *
 * If `currentTopic` doesn't appear in the path at all, the first non-completed
 * topic is treated as the current one (defensive fallback).
 */
export function tagGrammarPath(
  completed: string[],
  currentTopic: string,
): TaggedTopic[] {
  const completedSet = new Set(completed);

  // Pick the index of the "current" topic. Preference: first non-completed
  // topic whose name matches `currentTopic`. Fallback: first non-completed
  // topic, regardless of name.
  let currentIndex = -1;
  for (let i = 0; i < GRAMMAR_PATH.length; i++) {
    const name = GRAMMAR_PATH[i]!;
    if (completedSet.has(name)) continue;
    if (name === currentTopic) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex === -1) {
    for (let i = 0; i < GRAMMAR_PATH.length; i++) {
      const name = GRAMMAR_PATH[i]!;
      if (!completedSet.has(name)) {
        currentIndex = i;
        break;
      }
    }
  }

  return GRAMMAR_PATH.map((name, i): TaggedTopic => {
    if (completedSet.has(name)) return { name, state: 'completed' };
    if (i === currentIndex) return { name, state: 'current' };
    if (currentIndex === -1) return { name, state: 'completed' };
    if (i - currentIndex > LOCK_DISTANCE) return { name, state: 'locked' };
    return { name, state: 'upcoming' };
  });
}
