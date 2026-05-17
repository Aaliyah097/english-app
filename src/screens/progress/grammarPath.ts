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

// Short fallback rule for each canonical topic. Used when the checkpoint's
// currentLearningFocus.rule is empty — either an old stored checkpoint or a
// turn where the AI didn't include the rule field. Examples are intentionally
// everyday-life scenes so the rule reads naturally regardless of the user's
// declared interests; the AI is encouraged to override with something more
// tailored on the next turn.
const DEFAULT_RULES: Record<string, string> = {
  'Present Simple':
    'Use Present Simple for facts, habits, and routines — e.g. "She drinks coffee every morning."',
  'Present Continuous':
    'Use Present Continuous for actions happening right now or around now — e.g. "I\'m reading a book."',
  'Past Simple':
    'Use Past Simple for finished actions at a specific past time — e.g. "We visited Paris last summer."',
  'Future Simple':
    "Use `will` for spontaneous decisions and predictions, `be going to` for plans — e.g. \"I'll call you later.\" / \"We're going to move next year.\"",
  'Present Perfect':
    'Use Present Perfect for past actions still connected to now — e.g. "I\'ve already eaten."',
  'Present Perfect vs Past Simple':
    'Past Simple for a finished moment ("I saw her yesterday"); Present Perfect for unfinished time or recent relevance ("I\'ve seen that film").',
  'Past Continuous':
    'Use Past Continuous for an action in progress in the past, often interrupted — e.g. "I was cooking when the phone rang."',
  'Compound sentences':
    'Join two independent clauses with `and`, `but`, `or`, or `so` — e.g. "It was raining, but we went for a walk anyway."',
  'Complex sentences':
    'Attach a subordinate clause with `because`, `since`, `although`, `while`, `if`… — e.g. "I stayed home because I was tired."',
  Conditionals:
    'Zero conditional for general truths ("If you heat water, it boils"); first for likely futures ("If it rains, we\'ll stay in").',
  'Passive voice':
    'In passive voice the subject receives the action — e.g. "The cake was eaten by the kids."',
  'Relative clauses':
    'Use `who/which/that` to add information about a noun — e.g. "The book that I\'m reading is great."',
  'Advanced explanations and trade-offs':
    'Explain decisions clearly: state the choice, the trade-off, and the reason — e.g. "I prefer trains over flying because they\'re more comfortable, even if slower."',
};

/** Returns a short default rule for the given topic, or '' if none is known. */
export function defaultRuleFor(topic: string): string {
  return DEFAULT_RULES[topic] ?? '';
}

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
