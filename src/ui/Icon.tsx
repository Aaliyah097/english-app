import type { ReactElement } from 'react';

// Small stroke-based icon set ported from ai/design/project/src/icons.jsx.
// Each icon takes an optional `s` (pixel size) and inherits stroke from currentColor.

type Props = { s?: number };
export type IconFn = (props: Props) => ReactElement;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon = {
  Chat: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <path d="M21 12c0 4.4-4 8-9 8a10 10 0 0 1-3.4-.6L3 21l1.4-4.3A7.5 7.5 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
    </svg>
  ),
  Cards: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <rect x="3" y="6" width="14" height="14" rx="2.5" />
      <path d="M7 3h12a2 2 0 0 1 2 2v12" />
    </svg>
  ),
  Chart: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </svg>
  ),
  Cog: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Arrow: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2" {...base}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  Send: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2" {...base}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Up: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  Down: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Left: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  Check: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2" {...base}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  X: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2" {...base}>
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),
  Plus: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="2" {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Flame: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.2.4-2.2 1-3 .4 1 1 1.5 2 1.5 0-2.5-1-5 1-7.5z" />
      <path d="M8.5 14.5c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5" />
    </svg>
  ),
  Book: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
      <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
    </svg>
  ),
  Sparkle: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7z" />
    </svg>
  ),
  Search: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  Globe: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  Mic: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  ),
  Lock: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.6" {...base}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  Dot: ({ s = 6 }) => (
    <svg width={s} height={s} viewBox="0 0 6 6">
      <circle cx="3" cy="3" r="3" fill="currentColor" />
    </svg>
  ),
} satisfies Record<string, IconFn>;

export type IconName = keyof typeof Icon;
