import { theme as T } from '../../theme';
import { Icon } from '../../ui';

type Props = {
  goal: string;
  onChange: (label: string) => void;
};

const GOALS: ReadonlyArray<{ id: string; name: string; blurb: string }> = [
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

export function StepGoal({ goal, onChange }: Props) {
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
        And one thing
        <br />
        you're aiming for.
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>
        This shapes the tone of corrections — work vocab vs. casual register.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GOALS.map((g) => {
          const on = goal === g.name;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.name)}
              style={{
                background: on ? T.ink : T.surface,
                color: on ? T.bg : T.ink,
                border: `0.5px solid ${on ? T.ink : T.border}`,
                borderRadius: 16,
                padding: '12px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{g.blurb}</div>
              </div>
              {on && <Icon.Check s={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
