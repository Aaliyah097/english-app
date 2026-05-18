// Typed, schema-validated localStorage wrapper.
//
// Every read runs Zod safeParse, so corrupted data returns `null` instead
// of throwing. Every write notifies subscribers so React screens can refresh
// via useStorageSnapshot (see ./useStorageSnapshot.ts).
//
// This file is the *only* place outside of tests that touches localStorage
// directly. Downstream stories must read/write through these helpers.

import { z } from 'zod';
import {
  learningCheckpointSchema,
  partialLearningCheckpointSchema,
  userProfileSchema,
} from '../schemas';
import type { LearningCheckpoint, PartialLearningCheckpoint, UserProfile } from '../types';
import { KEY_PREFIX, SCHEMA_VERSION, STORAGE_KEYS } from './keys';

// ── low-level helpers ──────────────────────────────────────────────────────

function readJson<S extends z.ZodTypeAny>(key: string, schema: S): z.output<S> | null {
  const raw = localStorage.getItem(key);
  if (raw == null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = schema.safeParse(parsed);
  return result.success ? result.data : null;
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── pub-sub ────────────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
function notify(): void {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ── checkpoint (single source of truth) ────────────────────────────────────

export function getCheckpoint(): LearningCheckpoint | null {
  return readJson(STORAGE_KEYS.checkpoint, learningCheckpointSchema);
}

export function setCheckpoint(c: LearningCheckpoint): void {
  writeJson(STORAGE_KEYS.checkpoint, learningCheckpointSchema.parse(c));
  notify();
}

// ── profile (derived from the checkpoint) ──────────────────────────────────
//
// The profile is a nested field on LearningCheckpoint. These helpers exist
// so callers can read/write profile without knowing the larger shape.

export function getUserProfile(): UserProfile | null {
  return getCheckpoint()?.userProfile ?? null;
}

/**
 * Updates the nested userProfile on the existing checkpoint. Requires a
 * checkpoint to already exist — onboarding writes the initial state via
 * `setCheckpoint` (which carries the first profile), and every later edit
 * goes through here.
 */
export function setUserProfile(p: UserProfile): void {
  const validated = userProfileSchema.parse(p);
  const current = getCheckpoint();
  if (!current) {
    throw new Error('setUserProfile: no checkpoint stored yet — call setCheckpoint first');
  }
  writeJson(STORAGE_KEYS.checkpoint, { ...current, userProfile: validated });
  notify();
}

/**
 * Shallow-merge a partial checkpoint into the existing one. The two nested
 * objects (currentLearningFocus, currentTopicProgress) are also shallow-merged
 * so a patch can touch one inner field without clobbering its siblings.
 * Top-level arrays like `completedTopics` are replaced wholesale by the patch.
 */
export function mergeCheckpoint(
  patch: PartialLearningCheckpoint,
): LearningCheckpoint {
  const current = getCheckpoint();
  if (!current) {
    throw new Error('mergeCheckpoint: no checkpoint stored yet — call setCheckpoint first');
  }

  // Validate the patch shape before merging — catches obviously bad updates.
  partialLearningCheckpointSchema.parse(patch);

  // Spreading a deep-partial patch over a full checkpoint produces fields
  // typed as `T | undefined` in TS, even though at runtime the spread just
  // overwrites with whatever the patch provides. Zod re-validates below so
  // the runtime guarantee holds; the cast tells TS we know that.
  const merged = {
    ...current,
    ...patch,
    currentLearningFocus: {
      ...current.currentLearningFocus,
      ...(patch.currentLearningFocus ?? {}),
    },
    currentTopicProgress: {
      ...current.currentTopicProgress,
      ...(patch.currentTopicProgress ?? {}),
    },
  } as LearningCheckpoint;

  const validated = learningCheckpointSchema.parse(merged);
  writeJson(STORAGE_KEYS.checkpoint, validated);
  notify();
  return validated;
}

// ── export / import / reset ────────────────────────────────────────────────

const exportEnvelopeSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  checkpoint: learningCheckpointSchema.nullable(),
});

export function exportAll(): string {
  const envelope = {
    schemaVersion: SCHEMA_VERSION,
    checkpoint: getCheckpoint(),
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Replaces the stored checkpoint with the contents of an export envelope.
 * Throws on invalid JSON or schema mismatch — leaves existing state intact.
 */
export function importAll(json: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Import failed: file is not valid JSON');
  }
  const result = exportEnvelopeSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Import failed: ${result.error.issues[0]?.message ?? 'schema mismatch'}`);
  }
  if (result.data.checkpoint) {
    writeJson(STORAGE_KEYS.checkpoint, result.data.checkpoint);
  } else {
    localStorage.removeItem(STORAGE_KEYS.checkpoint);
  }
  notify();
}

/**
 * Wipes everything this app owns (profile, checkpoint). The Settings screen
 * wraps this with a confirmation dialog (see story S11).
 */
export function resetAll(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(KEY_PREFIX + ':')) toRemove.push(k);
  }
  for (const k of toRemove) localStorage.removeItem(k);
  notify();
}
