// Namespaced, versioned storage keys. Bump the version (and migrate) if any
// persisted schema changes shape.

export const SCHEMA_VERSION = 1 as const;

const NS = `englishly:v${SCHEMA_VERSION}` as const;

export const STORAGE_KEYS = {
  // Everything the user owns lives in a single `checkpoint` blob — including
  // the nested `userProfile`. The previous standalone `:profile` key has been
  // retired; getUserProfile/setUserProfile now read and write through here.
  checkpoint: `${NS}:checkpoint`,
} as const;

// Prefix used by resetAll() to wipe everything we own.
export const KEY_PREFIX = NS;
