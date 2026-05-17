// Word-level diff helper.
//
// Given the user's raw answer and the AI's corrected answer (both plain
// strings), produce a token array shaped like the mockup's `exercise.diff`
// field — see ai/design/project/src/data.js.
//
// Token statuses:
//   ok    — word present in both, unchanged
//   wrong — word in user version replaced by another in corrected version
//           (carries the replacement in `fix`)
//   drop  — word only in user version (extra word to remove)
//   add   — word only in corrected version (carries the addition in `add`)
//
// Algorithm: word-level LCS, then walk both sequences emitting tokens.
// Adjacent (drop, add) pairs are coalesced into a single `wrong` token so
// the visual matches the mockup's strikethrough+highlight pattern.

export type DiffStatus = 'ok' | 'wrong' | 'drop' | 'add';

export type DiffToken = {
  t: string;
  s: DiffStatus;
  fix?: string;
  add?: string;
};

function tokenize(s: string): string[] {
  // Split on whitespace; preserve punctuation glued to words (good enough for
  // a per-word visual diff — the AI's correctedAnswer is the source of truth
  // for the actual corrected text shown elsewhere).
  const trimmed = s.trim();
  return trimmed.length === 0 ? [] : trimmed.split(/\s+/);
}

// Lowercase + strip leading/trailing punctuation so the diff treats
// "Europe", "europe", "europe.", and "(Europe)" as the same token. The
// AI is instructed to ignore punctuation in mistakes; this keeps the
// client-side visual diff consistent with that promise.
function normalize(word: string): string {
  return word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '').toLowerCase();
}

function tableAt(table: number[][], i: number, j: number): number {
  return table[i]?.[j] ?? 0;
}

// Build LCS table for word arrays — compares via normalized keys so
// punctuation/casing differences don't break matches.
function lcsTable(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const aKeys = a.map(normalize);
  const bKeys = b.map(normalize);
  const table: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const row = table[i]!;
      if (aKeys[i - 1] === bKeys[j - 1]) {
        row[j] = tableAt(table, i - 1, j - 1) + 1;
      } else {
        row[j] = Math.max(tableAt(table, i - 1, j), tableAt(table, i, j - 1));
      }
    }
  }
  return table;
}

type Op =
  | { kind: 'ok'; word: string }
  | { kind: 'drop'; word: string }
  | { kind: 'add'; word: string };

function walk(a: string[], b: string[], table: number[][]): Op[] {
  const aKeys = a.map(normalize);
  const bKeys = b.map(normalize);
  const ops: Op[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aKeys[i - 1] === bKeys[j - 1]) {
      // Prefer the corrected-side display so punctuation matches the
      // AI's clean output even though we matched via the normalized key.
      ops.push({ kind: 'ok', word: b[j - 1]! });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || tableAt(table, i, j - 1) >= tableAt(table, i - 1, j))) {
      ops.push({ kind: 'add', word: b[j - 1]! });
      j--;
    } else {
      ops.push({ kind: 'drop', word: a[i - 1]! });
      i--;
    }
  }
  return ops.reverse();
}

export function diffWords(userAnswer: string, correctedAnswer: string): DiffToken[] {
  const a = tokenize(userAnswer);
  const b = tokenize(correctedAnswer);
  const table = lcsTable(a, b);
  const ops = walk(a, b, table);

  const tokens: DiffToken[] = [];
  for (let k = 0; k < ops.length; k++) {
    const op = ops[k]!;
    if (op.kind === 'ok') {
      tokens.push({ t: op.word, s: 'ok' });
      continue;
    }
    // Coalesce adjacent (drop, add) and (add, drop) into a single `wrong`
    // so the visual reads as "<strikethrough word> <highlight replacement>".
    const next = ops[k + 1];
    if (op.kind === 'drop' && next && next.kind === 'add') {
      tokens.push({ t: op.word, s: 'wrong', fix: next.word });
      k++;
      continue;
    }
    if (op.kind === 'add' && next && next.kind === 'drop') {
      tokens.push({ t: next.word, s: 'wrong', fix: op.word });
      k++;
      continue;
    }
    if (op.kind === 'drop') {
      tokens.push({ t: op.word, s: 'drop' });
    } else {
      tokens.push({ t: '', s: 'add', add: op.word });
    }
  }
  return tokens;
}
