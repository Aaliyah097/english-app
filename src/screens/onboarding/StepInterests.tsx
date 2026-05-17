import { theme as T } from '../../theme';
import { Icon } from '../../ui';

type Props = {
  selected: string[];
  onToggle: (interest: string) => void;
};

const ALL_INTERESTS: ReadonlyArray<string> = [
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

export function StepInterests({ selected, onToggle }: Props) {
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
        Pick a few worlds
        <br />
        you know well.
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>
        We'll draw sentences from these.{' '}
        <span style={{ color: T.ink2 }}>{selected.length} selected</span>.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_INTERESTS.map((t) => {
          const on = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              style={{
                border: `0.5px solid ${on ? T.ink : T.border}`,
                background: on ? T.ink : T.surface,
                color: on ? T.bg : T.ink,
                borderRadius: 999,
                padding: '8px 14px',
                fontFamily: T.fontBody,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {on && <Icon.Check s={12} />}
              {t}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 28,
          background: T.surface2,
          border: `0.5px dashed ${T.borderStrong}`,
          borderRadius: 14,
          padding: 14,
          display: 'flex',
          gap: 10,
        }}
      >
        <div style={{ color: T.accent, marginTop: 2 }}>
          <Icon.Sparkle s={18} />
        </div>
        <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.45 }}>
          With <b>Software dev</b> selected, your first exercises will involve services,
          APIs, databases, Kafka, deployments, and code review.
        </div>
      </div>
    </div>
  );
}
