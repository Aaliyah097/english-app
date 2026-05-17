import type { ReactNode } from 'react';
import { theme as T } from '../theme';

type Props = {
  children: ReactNode;
  side: 'ai' | 'user';
  pad?: 'rule' | 'normal';
};

export function Bubble({ children, side, pad = 'normal' }: Props) {
  const isAI = side === 'ai';
  return (
    <div
      style={{
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        maxWidth: '92%',
        background: isAI ? T.surface : T.ink,
        color: isAI ? T.ink : T.bg,
        border: isAI ? `0.5px solid ${T.border}` : `0.5px solid ${T.ink}`,
        padding: pad === 'rule' ? '10px 14px' : '12px 14px',
        borderRadius: 18,
        borderBottomLeftRadius: isAI ? 6 : 18,
        borderBottomRightRadius: isAI ? 18 : 6,
        boxShadow: isAI
          ? '0 1px 0 rgba(255,255,255,0.4) inset, 0 2px 8px rgba(40,30,20,0.03)'
          : 'none',
      }}
    >
      {children}
    </div>
  );
}
