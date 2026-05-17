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
// turn where the AI didn't include the rule field. Keep these terse; the AI
// is allowed to override with something more tailored.
const DEFAULT_RULES: Record<string, string> = {
  'Present Simple':
    'Use Present Simple for facts, habits, and how things normally work — e.g. "The service reads messages from Kafka."',
  'Present Continuous':
    'Use Present Continuous for actions happening now or around now — e.g. "I\'m debugging the consumer."',
  'Past Simple':
    'Use Past Simple for finished actions at a specific past time — e.g. "We deployed the fix yesterday."',
  'Future Simple':
    "Use `will` for spontaneous decisions and predictions, `be going to` for plans — e.g. \"I'll handle it.\" / \"We're going to scale up.\"",
  'Present Perfect':
    'Use Present Perfect for past actions still connected to now — e.g. "We\'ve already shipped that."',
  'Present Perfect vs Past Simple':
    'Past Simple for a finished moment ("we shipped Tuesday"); Present Perfect for an unfinished time or recent relevance ("we\'ve shipped it").',
  'Past Continuous':
    'Use Past Continuous for an action in progress in the past, often interrupted — e.g. "I was reviewing the PR when it failed."',
  'Compound sentences':
    'Join two independent clauses with `and`, `but`, `or`, or `so` — e.g. "It compiled, but the test failed."',
  'Complex sentences':
    'Attach a subordinate clause with `because`, `since`, `although`, `while`, `if`… — e.g. "We rolled back because metrics tanked."',
  Conditionals:
    'Zero conditional for general truths ("If you push to main, CI runs"); first for likely futures ("If it fails, we\'ll retry").',
  'Passive voice':
    'In passive voice the subject receives the action — e.g. "The deploy was approved by ops."',
  'Relative clauses':
    'Use `who/which/that` to add information about a noun — e.g. "The service that handles auth is down."',
  'Advanced explanations and trade-offs':
    'Explain decisions clearly: state the choice, the trade-off, and the reason — e.g. "We chose Kafka over RabbitMQ because we needed durable log replay."',
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
