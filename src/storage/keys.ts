// Namespaced, versioned storage keys. Bump the version (and migrate) if any
// persisted schema changes shape.

export const SCHEMA_VERSION = 1 as const;

const NS = `englishly:v${SCHEMA_VERSION}` as const;

export const STORAGE_KEYS = {
  profile: `${NS}:profile`,
  checkpoint: `${NS}:checkpoint`,
  apiKey: `${NS}:apiKey`,
} as const;

// Prefix used by resetAll() to wipe everything we own.
export const KEY_PREFIX = NS;
