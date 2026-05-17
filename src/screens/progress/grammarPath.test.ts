import { describe, expect, it } from 'vitest';
import { GRAMMAR_PATH, tagGrammarPath } from './grammarPath';

describe('GRAMMAR_PATH', () => {
  it('contains the 13 canonical topics from the brief', () => {
    expect(GRAMMAR_PATH).toHaveLength(13);
    expect(GRAMMAR_PATH[0]).toBe('Present Simple');
    expect(GRAMMAR_PATH[GRAMMAR_PATH.length - 1]).toBe(
      'Advanced explanations and trade-offs',
    );
  });
});

describe('tagGrammarPath', () => {
  it('marks the current topic and the next one as upcoming when nothing is completed', () => {
    const tagged = tagGrammarPath([], 'Present Simple');

    const byName = Object.fromEntries(tagged.map((t) => [t.name, t.state]));
    expect(byName['Present Simple']).toBe('current');
    expect(byName['Present Continuous']).toBe('upcoming');
  });

  it('marks a completed topic as completed regardless of position', () => {
    const tagged = tagGrammarPath(['Present Simple'], 'Present Continuous');

    const byName = Object.fromEntries(tagged.map((t) => [t.name, t.state]));
    expect(byName['Present Simple']).toBe('completed');
    expect(byName['Present Continuous']).toBe('current');
  });

  it('locks topics that are far past the current marker', () => {
    const tagged = tagGrammarPath([], 'Present Simple');

    const byName = Object.fromEntries(tagged.map((t) => [t.name, t.state]));
    // Index 6 is more than 4 positions past index 0 → should be locked.
    expect(byName['Past Continuous']).toBe('locked');
    expect(byName['Advanced explanations and trade-offs']).toBe('locked');
    // A topic within the window should not be locked.
    expect(byName['Future Simple']).toBe('upcoming');
  });
});
