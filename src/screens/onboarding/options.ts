// Shared option lists for the onboarding steps. Settings (S11) reuses these so
// the two surfaces never drift. Keep behaviour identical to S06.

import type { z } from 'zod';
import type { goalIdSchema } from '../../schemas';
import type { StringKey } from '../../i18n/strings';
import type { Level } from '../../types';

type GoalId = z.infer<typeof goalIdSchema>;

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
  { id: 'Software dev', labelKey: 'interest.softwareDev' },
  { id: 'Architecture', labelKey: 'interest.architecture' },
  { id: 'DevOps', labelKey: 'interest.devops' },
  { id: 'Data', labelKey: 'interest.data' },
  { id: 'Business', labelKey: 'interest.business' },
  { id: 'Design', labelKey: 'interest.design' },
  { id: 'Marketing', labelKey: 'interest.marketing' },
  { id: 'Finance', labelKey: 'interest.finance' },
  { id: 'Medicine', labelKey: 'interest.medicine' },
  { id: 'Gaming', labelKey: 'interest.gaming' },
  { id: 'Travel', labelKey: 'interest.travel' },
  { id: 'Music', labelKey: 'interest.music' },
  { id: 'Management', labelKey: 'interest.management' },
  { id: 'Psychology', labelKey: 'interest.psychology' },
  { id: 'Education', labelKey: 'interest.education' },
  { id: 'Everyday life', labelKey: 'interest.everydayLife' },
];

export const LEVELS: ReadonlyArray<{ id: Level; nameKey: StringKey; blurbKey: StringKey }> = [
  { id: 'beginner', nameKey: 'level.beginner.name', blurbKey: 'level.beginner.blurb' },
  {
    id: 'beginner_intermediate',
    nameKey: 'level.beginnerIntermediate.name',
    blurbKey: 'level.beginnerIntermediate.blurb',
  },
  {
    id: 'intermediate',
    nameKey: 'level.intermediate.name',
    blurbKey: 'level.intermediate.blurb',
  },
  {
    id: 'upper_intermediate',
    nameKey: 'level.upperIntermediate.name',
    blurbKey: 'level.upperIntermediate.blurb',
  },
];

// Goal `id` is stored on the profile and sent to the AI; name/blurb are i18n.
// The IDs match goalIdSchema (a closed enum the request validator enforces).
export const GOALS: ReadonlyArray<{ id: GoalId; nameKey: StringKey; blurbKey: StringKey }> = [
  { id: 'conversational', nameKey: 'goal.conversational.name', blurbKey: 'goal.conversational.blurb' },
  { id: 'work', nameKey: 'goal.work.name', blurbKey: 'goal.work.blurb' },
  { id: 'interview', nameKey: 'goal.interview.name', blurbKey: 'goal.interview.blurb' },
  { id: 'travel', nameKey: 'goal.travel.name', blurbKey: 'goal.travel.blurb' },
  { id: 'fluency', nameKey: 'goal.fluency.name', blurbKey: 'goal.fluency.blurb' },
];
