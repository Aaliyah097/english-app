// String table + lookup helper. Russian is the default UI locale (all users
// are native Russian speakers); when the user picks a target language to
// learn, the UI switches to that language for immersion. Only 3 target
// languages are supported in v1: en, es, it.

import { strings, type StringKey } from './strings';

export type Locale = 'ru' | 'en' | 'es' | 'it';

export const SUPPORTED_TARGET_LOCALES: ReadonlyArray<Locale> = ['en', 'es', 'it'];

export function isSupportedLocale(code: string): code is Locale {
  return code === 'ru' || code === 'en' || code === 'es' || code === 'it';
}

/**
 * Translate a key into the given locale. If a string is missing in the
 * target locale, falls back to Russian (the master locale). If it's missing
 * there too, returns the key itself so missing translations are visible
 * during development.
 *
 * Optional `params` interpolates `{name}` placeholders in the source string.
 */
export function t(
  locale: Locale,
  key: StringKey,
  params?: Record<string, string | number>,
): string {
  const fromLocale = strings[locale]?.[key];
  const raw = fromLocale ?? strings.ru[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    return v == null ? `{${name}}` : String(v);
  });
}
