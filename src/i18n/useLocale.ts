import { useEffect, useState } from 'react';
import { getUserProfile, subscribe } from '../storage';
import { isSupportedLocale, type Locale } from './index';

/**
 * Returns the current UI locale, derived from the user's chosen target
 * language. Falls back to Russian when no profile exists (e.g. during
 * onboarding) or when the target isn't one of the supported UI locales.
 *
 * Re-runs on every storage notification so changing the target language in
 * Settings re-renders the whole app immediately.
 */
export function useLocale(): Locale {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  const profile = getUserProfile();
  if (profile && isSupportedLocale(profile.targetLanguage)) {
    // We only switch the UI to the target if it's en/es/it; Russian users
    // who haven't picked yet (or picked something unsupported) see Russian.
    if (profile.targetLanguage !== 'ru') return profile.targetLanguage;
  }
  return 'ru';
}
