import type { CSSProperties, ReactNode } from 'react';
import { theme as T } from '../theme';

export type ChipTone = 'neutral' | 'accent' | 'good' | 'warn' | 'ink';
export type ChipSize = 'sm' | 'md';

type Props = {
  children: ReactNode;
  tone?: ChipTone;
  size?: ChipSize;
  style?: CSSProperties;
};

const TONES: Record<ChipTone, { bg: string; ink: string; bd: string }> = {
  neutral: { bg: T.surface2, ink: T.ink2, bd: T.border },
  accent: { bg: T.accentBg, ink: T.accentInk, bd: T.accentSoft },
  good: { bg: T.goodSoft, ink: '#3f5a2f', bd: '#bfcaa5' },
  warn: { bg: T.warnSoft, ink: '#7a5a1c', bd: '#dcc89a' },
  ink: { bg: T.ink, ink: '#faf9f6', bd: T.ink },
};

export function Chip({ children, tone = 'neutral', size = 'md', style }: Props) {
  const c = TONES[tone];
  const sz: CSSProperties =
    size === 'sm'
      ? { padding: '2px 8px', fontSize: 10.5, height: 18 }
      : { padding: '4px 10px', fontSize: 12, height: 24 };
  return (
    <span
      style={{
        ...sz,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: c.bg,
        color: c.ink,
        border: `0.5px solid ${c.bd}`,
        borderRadius: 999,
        fontFamily: T.fontBody,
        fontWeight: 500,
        letterSpacing: 0.1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
