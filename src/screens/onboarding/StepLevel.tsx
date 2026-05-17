import { theme as T } from '../../theme';
import type { Level } from '../../types';
import { Icon } from '../../ui';

type Props = {
  level: Level;
  onChange: (level: Level) => void;
};

const LEVELS: ReadonlyArray<{ id: Level; name: string; blurb: string }> = [
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

export function StepLevel({ level, onChange }: Props) {
  return (
    <div>
      <div
        style={{
          fontFamily: T.fontDisplay,
          fontSize: 32,
          fontStyle: 'italic',
          lineHeight: 1.05,
          letterSpacing: -0.4,
          marginBottom: 8,
        }}
      >
        Where are you
        <br />
        right now?
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>
        Be honest — you can change this any time.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map((l) => {
          const on = level === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange(l.id)}
              style={{
                background: on ? T.ink : T.surface,
                color: on ? T.bg : T.ink,
                border: `0.5px solid ${on ? T.ink : T.border}`,
                borderRadius: 18,
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: T.fontBody,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: 15.5, fontWeight: 500 }}>{l.name}</div>
                {on && <Icon.Check s={16} />}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 4, lineHeight: 1.35 }}>
                {l.blurb}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
