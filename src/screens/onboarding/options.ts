// Shared option lists for the onboarding steps. Settings (S11) reuses these so
// the two surfaces never drift. Keep behaviour identical to S06.

import type { StringKey } from '../../i18n/strings';

// v1 assumes all users are native Russian speakers — no native-language picker.
// The native code is hardcoded as 'ru' wherever we need it.
export const NATIVE_LANGUAGE_CODE = 'ru' as const;

// Languages the user can practise. Restricted to the three locales we ship
// full UI translations for. Each entry's `name` is shown in the picker (it's
// the language's native name, so a Russian user picking targets sees them in
// each target language's own glyphs).
export const TARGET_LANGUAGES: ReadonlyArray<{ code: string; name: string; en: string }> = [
  { code: 'en', name: 'English', en: 'English' },
  { code: 'es', name: 'Español', en: 'Spanish' },
  { code: 'it', name: 'Italiano', en: 'Italian' },
];

// Interest IDs are stored canonical (English label) on the profile and sent
// to the AI as-is. The displayed label is resolved via i18n at render time.
export const ALL_INTERESTS: ReadonlyArray<{ id: string; labelKey: StringKey }> = [
  { id: 'Software development', labelKey: 'interest.softwareDev' },
  { id: 'Software architecture', labelKey: 'interest.architecture' },
  { id: 'DevOps / SRE', labelKey: 'interest.devops' },
  { id: 'Data', labelKey: 'interest.data' },
  { id: 'Product management', labelKey: 'interest.productMgmt' },
  { id: 'Product design', labelKey: 'interest.design' },
  { id: 'QA / testing', labelKey: 'interest.qa' },
  { id: 'Cybersecurity', labelKey: 'interest.cybersecurity' },
  { id: 'Engineering management', labelKey: 'interest.engMgmt' },
  { id: 'Everyday life', labelKey: 'interest.everydayLife' },
];

