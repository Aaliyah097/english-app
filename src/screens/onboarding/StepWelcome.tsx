import { theme as T } from '../../theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';

export function StepWelcome() {
  const locale = useLocale();
  return (
    <div style={{ padding: '40px 4px 0' }}>
      {/* small wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: T.ink,
            color: T.bg,
            display: 'grid',
            placeItems: 'center',
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1,
            paddingBottom: 2,
          }}
        >
          E
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
          englishly · v0.1
        </div>
      </div>

      <div
        style={{
          fontFamily: T.fontDisplay,
          fontSize: 38,
          lineHeight: 1.1,
          letterSpacing: -0.6,
          marginBottom: 18,
        }}
      >
        {t(locale, 'onboarding.welcome.headline')
          .split('\n')
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </div>

      <div style={{ fontSize: 15.5, color: T.ink2, lineHeight: 1.5, marginBottom: 36 }}>
        {t(locale, 'onboarding.welcome.body')}
      </div>

      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 18,
          padding: 18,
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 10.5,
            color: T.muted,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          {t(locale, 'onboarding.welcome.sampleLabel')}
        </div>
        <div style={{ color: T.ink2, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>
          Она пьёт кофе каждое утро.
        </div>
        <div style={{ height: 0.5, background: T.border, margin: '12px -18px' }} />
        <div style={{ color: T.ink, fontSize: 14, lineHeight: 1.4 }}>
          She <span style={{ color: T.accent, fontWeight: 500 }}>drinks</span> coffee every
          morning.
        </div>
      </div>
    </div>
  );
}
