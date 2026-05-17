import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { ALL_INTERESTS } from './options';

type Props = {
  selected: string[];
  onToggle: (interest: string) => void;
};

export function StepInterests({ selected, onToggle }: Props) {
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
        {t(locale, 'onboarding.interests.title')
          .split('\n')
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>
        {t(locale, 'onboarding.interests.subtitle', { count: selected.length })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_INTERESTS.map(({ id, labelKey }) => {
          const on = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
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
              {t(locale, labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
