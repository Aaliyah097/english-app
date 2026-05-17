import type { CSSProperties, ReactNode } from 'react';
import { theme as T } from '../theme';

export type BtnKind = 'primary' | 'accent' | 'secondary' | 'ghost';
export type BtnSize = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  kind?: BtnKind;
  size?: BtnSize;
  icon?: ReactNode;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
};

const KINDS: Record<BtnKind, { bg: string; fg: string; bd: string }> = {
  primary: { bg: T.ink, fg: '#faf9f6', bd: T.ink },
  accent: { bg: T.accent, fg: '#fff', bd: T.accent },
  secondary: { bg: T.surface, fg: T.ink, bd: T.borderStrong },
  ghost: { bg: 'transparent', fg: T.ink2, bd: 'transparent' },
};

function sizeStyles(size: BtnSize): CSSProperties {
  if (size === 'sm') return { height: 32, padding: '0 14px', fontSize: 13, borderRadius: 16 };
  if (size === 'lg') return { height: 52, padding: '0 22px', fontSize: 15.5, borderRadius: 26 };
  return { height: 42, padding: '0 18px', fontSize: 14, borderRadius: 21 };
}

export function Btn({
  children,
  kind = 'primary',
  size = 'md',
  icon,
  full = false,
  onClick,
  disabled = false,
  style,
  type = 'button',
}: Props) {
  const c = KINDS[kind];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizeStyles(size),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: c.bg,
        color: c.fg,
        border: `0.5px solid ${c.bd}`,
        width: full ? '100%' : undefined,
        fontFamily: T.fontBody,
        fontWeight: 500,
        letterSpacing: 0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
      {icon}
    </button>
  );
}
