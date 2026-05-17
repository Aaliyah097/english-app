import { theme as T } from '../../theme';
import type { Level } from '../../types';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { LEVELS } from './options';

type Props = {
  level: Level;
  onChange: (level: Level) => void;
};

export function StepLevel({ level, onChange }: Props) {
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
        {t(locale, 'onboarding.level.title')
          .split('\n')
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>
        {t(locale, 'onboarding.level.subtitle')}
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
                <div style={{ fontSize: 15.5, fontWeight: 500 }}>{t(locale, l.nameKey)}</div>
                {on && <Icon.Check s={16} />}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 4, lineHeight: 1.35 }}>
                {t(locale, l.blurbKey)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
