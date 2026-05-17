import { describe, expect, it } from 'vitest';
import { diffWords } from './diff';

describe('diffWords', () => {
  it('marks every token as ok when answers match', () => {
    const tokens = diffWords('I work remotely', 'I work remotely');
    expect(tokens).toEqual([
      { t: 'I', s: 'ok' },
      { t: 'work', s: 'ok' },
      { t: 'remotely', s: 'ok' },
    ]);
  });

  it('marks a replaced word as `wrong` with the fix', () => {
    const tokens = diffWords('This service read messages', 'This service reads messages');
    expect(tokens).toEqual([
      { t: 'This', s: 'ok' },
      { t: 'service', s: 'ok' },
      { t: 'read', s: 'wrong', fix: 'reads' },
      { t: 'messages', s: 'ok' },
    ]);
  });

  it('marks an extra user word as `drop`', () => {
    const tokens = diffWords('from the Kafka', 'from Kafka');
    expect(tokens).toEqual([
      { t: 'from', s: 'ok' },
      { t: 'the', s: 'drop' },
      { t: 'Kafka', s: 'ok' },
    ]);
  });

  it('marks a missing user word as `add`', () => {
    const tokens = diffWords('stores them in database', 'stores them in the database');
    expect(tokens).toEqual([
      { t: 'stores', s: 'ok' },
      { t: 'them', s: 'ok' },
      { t: 'in', s: 'ok' },
      { t: '', s: 'add', add: 'the' },
      { t: 'database', s: 'ok' },
    ]);
  });

  it('handles a fully empty user answer as a list of additions', () => {
    const tokens = diffWords('', 'I read books');
    expect(tokens).toEqual([
      { t: '', s: 'add', add: 'I' },
      { t: '', s: 'add', add: 'read' },
      { t: '', s: 'add', add: 'books' },
    ]);
  });

  it('ignores trailing punctuation differences (period-only)', () => {
    const tokens = diffWords('She often travels to Europe', 'She often travels to Europe.');
    expect(tokens.every((t) => t.s === 'ok')).toBe(true);
  });

  it('ignores capitalisation + punctuation differences across the sentence', () => {
    const tokens = diffWords(
      'i prefer trains over flying',
      'I prefer trains, over flying.',
    );
    expect(tokens.every((t) => t.s === 'ok')).toBe(true);
  });

  it('handles mixed replacements, drops, and additions', () => {
    const tokens = diffWords(
      'This service read messages from the Kafka and stores them into database',
      'This service reads messages from Kafka and stores them in the database',
    );
    // We don't pin every token shape (LCS has freedom around tie-breaks),
    // but every meaningful difference should be represented.
    const fixes = tokens.filter((t) => t.s === 'wrong');
    const drops = tokens.filter((t) => t.s === 'drop');
    const adds = tokens.filter((t) => t.s === 'add');
    expect(fixes.map((t) => `${t.t}->${t.fix}`)).toEqual(
      expect.arrayContaining(['read->reads', 'into->in']),
    );
    expect(drops.map((t) => t.t)).toEqual(expect.arrayContaining(['the']));
    expect(adds.map((t) => t.add)).toEqual(expect.arrayContaining(['the']));
  });
});
