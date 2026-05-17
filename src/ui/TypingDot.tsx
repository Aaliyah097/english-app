import { theme as T } from '../theme';

export function TypingDot() {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        padding: '10px 14px',
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        display: 'inline-flex',
        gap: 4,
        alignItems: 'center',
        opacity: 0.55,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: T.muted2 }} />
      <span style={{ width: 6, height: 6, borderRadius: 999, background: T.muted2 }} />
      <span style={{ width: 6, height: 6, borderRadius: 999, background: T.muted2 }} />
    </div>
  );
}
