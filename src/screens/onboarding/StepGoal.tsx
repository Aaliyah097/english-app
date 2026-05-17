import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { GOALS } from './options';

type Props = {
  goal: string;
  onChange: (id: string) => void;
};

export function StepGoal({ goal, onChange }: Props) {
  const locale = useLocale();
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
        {t(locale, 'onboarding.goal.title')
          .split('\n')
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>
        {t(locale, 'onboarding.goal.subtitle')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GOALS.map((g) => {
          const on = goal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.id)}
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
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{t(locale, g.nameKey)}</div>
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                  {t(locale, g.blurbKey)}
                </div>
              </div>
              {on && <Icon.Check s={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
