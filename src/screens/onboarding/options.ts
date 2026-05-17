// Shared option lists for the onboarding steps. Settings (S11) reuses these so
// the two surfaces never drift. Keep behaviour identical to S06.

import type { Level } from '../../types';

export const ALL_INTERESTS: ReadonlyArray<string> = [
  'Software dev',
  'Architecture',
  'DevOps',
  'Data',
  'Business',
  'Design',
  'Marketing',
  'Finance',
  'Medicine',
  'Gaming',
  'Travel',
  'Music',
  'Management',
  'Psychology',
  'Education',
  'Everyday life',
];

export const LEVELS: ReadonlyArray<{ id: Level; name: string; blurb: string }> = [
  {
    id: 'beginner',
    name: 'Beginner',
    blurb: 'I know basic words and some Present Simple.',
  },
  {
    id: 'beginner_intermediate',
    name: 'Beginner-Intermediate',
    blurb: 'I can get my point across in short sentences.',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    blurb: 'I can hold short conversations with mistakes.',
  },
  {
    id: 'upper_intermediate',
    name: 'Upper-Intermediate',
    blurb: 'I write at work but want to sound natural.',
  },
];

export const GOALS: ReadonlyArray<{ id: string; name: string; blurb: string }> = [
  {
    id: 'conversational',
    name: 'Conversational English',
    blurb: 'Speak more naturally in everyday situations.',
  },
  {
    id: 'work',
    name: 'Work communication',
    blurb: 'Reviews, standups, design docs, Slack threads.',
  },
  {
    id: 'interview',
    name: 'Technical interviews',
    blurb: 'Explain systems, trade-offs, and decisions.',
  },
  {
    id: 'travel',
    name: 'Travel English',
    blurb: 'Airports, hotels, food, getting around.',
  },
  {
    id: 'fluency',
    name: 'General fluency',
    blurb: 'Long-term, sustained improvement.',
  },
];
