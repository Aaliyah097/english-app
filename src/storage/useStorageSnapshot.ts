import { useSyncExternalStore } from 'react';
import { subscribe } from './index';

/**
 * React hook that re-runs `selector` whenever any storage entity is written.
 * The selector should return a stable reference (object identity matters for
 * useSyncExternalStore — return primitives or memoised objects).
 *
 * Example:
 *   const profile = useStorageSnapshot(getUserProfile);
 */
export function useStorageSnapshot<T>(selector: () => T): T {
  return useSyncExternalStore(subscribe, selector, selector);
}
