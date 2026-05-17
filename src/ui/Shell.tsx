import type { ReactNode } from 'react';
import { theme as T } from '../theme';

type ShellProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  bg?: string;
  padBottom?: number;
};

export function Shell({
  children,
  header,
  footer,
  bg = T.bg,
  padBottom = 96,
}: ShellProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        fontFamily: T.fontBody,
        color: T.ink,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {header}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          paddingBottom: padBottom,
        }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}

type TopBarProps = {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  sub?: string;
  ink?: string;
};

export function TopBar({ left, right, title, sub, ink = T.ink }: TopBarProps) {
  return (
    <div
      style={{
        padding: '60px 20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: ink }}>{left}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: ink }}>{right}</div>
      </div>
      {title && (
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: -0.4,
            color: ink,
            marginTop: 14,
            fontStyle: 'italic',
          }}
        >
          {title}
        </div>
      )}
      {sub && <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  right?: ReactNode;
};

export function SectionTitle({ children, right }: SectionTitleProps) {
  return (
    <div
      style={{
        padding: '0 22px',
        marginTop: 22,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontFamily: T.fontMono,
          fontSize: 10.5,
          color: T.muted,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </div>
      {right && <div style={{ fontSize: 12, color: T.accent }}>{right}</div>}
    </div>
  );
}
