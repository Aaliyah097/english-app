import { theme as T } from '../theme';

type Props = {
  name: string;
};

/**
 * Stand-in rendered for any screen that hasn't shipped yet (sibling stories
 * S06 / S07 / S10 / S11). Lets the App shell's routing be exercised — both
 * visually and in tests — before the real screens land.
 */
export function Placeholder({ name }: Props) {
  return (
    <div
      data-testid="screen-placeholder"
      data-screen={name}
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        color: T.ink,
        display: 'grid',
        placeItems: 'center',
        fontFamily: T.fontBody,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 32,
            letterSpacing: -0.6,
            marginBottom: 8,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 11,
            color: T.muted,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          screen placeholder
        </div>
      </div>
    </div>
  );
}
