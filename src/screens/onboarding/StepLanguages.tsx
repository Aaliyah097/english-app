import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { TARGET_LANGUAGES } from './options';

type Props = {
  target: string;
  onChangeTarget: (code: string) => void;
};

// Only the target-language picker — native is hardcoded to Russian (the user
// base is Russian-speaking, see options.NATIVE_LANGUAGE_CODE).
export function StepLanguages({ target, onChangeTarget }: Props) {
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
        {t(locale, 'onboarding.languages.title')
          .split('\n')
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 18 }}>
        {t(locale, 'onboarding.languages.subtitle')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TARGET_LANGUAGES.map((l) => {
          const on = target === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeTarget(l.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: on ? T.ink : T.surface,
                color: on ? T.bg : T.ink,
                border: `0.5px solid ${on ? T.ink : T.border}`,
                borderRadius: 16,
                padding: '14px 18px',
                fontFamily: T.fontBody,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span>{l.name}</span>
                <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>{l.en}</span>
              </span>
              {on && <Icon.Check s={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
