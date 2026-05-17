import { theme as T } from '../../theme';
import { Icon } from '../../ui';
import { NATIVE_LANGUAGES, TARGET_LANGUAGES } from './options';

type Props = {
  native: string;
  target: string;
  onChangeNative: (code: string) => void;
  onChangeTarget: (code: string) => void;
};

export function StepLanguages({ native, target, onChangeNative, onChangeTarget }: Props) {
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
        What's your
        <br />
        native language?
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 18 }}>
        We'll generate exercises in this language for you to translate.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NATIVE_LANGUAGES.map((l) => {
          const on = native === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeNative(l.code)}
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

      <div
        style={{
          marginTop: 28,
          fontFamily: T.fontDisplay,
          fontSize: 26,
          fontStyle: 'italic',
          lineHeight: 1.05,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
      >
        And what are you
        <br />
        learning?
      </div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 14 }}>
        You can change this later in Settings.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TARGET_LANGUAGES.map((l) => {
          const on = target === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeTarget(l.code)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: on ? T.ink : T.surface,
                color: on ? T.bg : T.ink,
                border: `0.5px solid ${on ? T.ink : T.border}`,
                borderRadius: 999,
                padding: '8px 14px',
                fontFamily: T.fontBody,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {on && <Icon.Check s={12} />}
              {l.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
