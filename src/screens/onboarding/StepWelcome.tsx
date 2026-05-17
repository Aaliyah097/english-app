import type { ReactNode } from 'react';
import { theme as T } from '../../theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';

function Wrong({ children }: { children: ReactNode }) {
  return (
    <s
      style={{
        color: '#a13d27',
        textDecorationThickness: 1.5,
        textDecorationColor: '#c4675a',
      }}
    >
      {children}
    </s>
  );
}

function Fix({ children }: { children: ReactNode }) {
  return (
    <mark
      style={{
        background: T.accentBg,
        color: T.accentInk,
        padding: '0 4px',
        borderRadius: 4,
        fontWeight: 500,
        boxShadow: `0 -2px 0 ${T.accentSoft} inset`,
      }}
    >
      {children}
    </mark>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12.5,
        color: T.ink2,
        lineHeight: 1.45,
        paddingLeft: 12,
        position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 7,
          width: 4,
          height: 4,
          borderRadius: 4,
          background: T.accent,
        }}
      />
      {children}
    </div>
  );
}

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
        <div style={{ color: T.ink2, fontSize: 14, marginBottom: 12, lineHeight: 1.4 }}>
          Каждое утро она пьёт кофе и читает газету на балконе.
        </div>

        <div style={{ height: 0.5, background: T.border, margin: '12px -18px' }} />

        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 9.5,
            color: T.muted,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          Ваш перевод
        </div>
        <div style={{ color: T.ink2, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
          Every morning she <Wrong>drink</Wrong> coffee and <Wrong>read</Wrong> newspaper on
          balcony.
        </div>

        <div
          style={{
            fontFamily: T.fontMono,
            fontSize: 9.5,
            color: T.accentInk,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Исправлено
        </div>
        <div style={{ color: T.ink, fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
          Every morning she <Fix>drinks</Fix> coffee and <Fix>reads</Fix>{' '}
          <Fix>the</Fix> newspaper on <Fix>the</Fix> balcony.
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            paddingTop: 10,
            borderTop: `0.5px solid ${T.border}`,
          }}
        >
          <Bullet>
            <b style={{ color: T.ink }}>Третье лицо ед. ч.</b> Подлежащее «она» — глагол
            берёт окончание <i>-s</i>.
          </Bullet>
          <Bullet>
            <b style={{ color: T.ink }}>Артикль.</b> Перед существительными в общем смысле
            нужен артикль: <i>the</i> newspaper, <i>the</i> balcony.
          </Bullet>
        </div>
      </div>
    </div>
  );
}
