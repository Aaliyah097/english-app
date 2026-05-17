import { theme as T } from '../../theme';
import { Chip, Icon } from '../../ui';

type Props = {
  native: string;
  onChange: (code: string) => void;
};

const LANGS: ReadonlyArray<{ code: string; name: string; en: string }> = [
  { code: 'ru', name: 'Русский', en: 'Russian' },
  { code: 'es', name: 'Español', en: 'Spanish' },
  { code: 'de', name: 'Deutsch', en: 'German' },
  { code: 'fr', name: 'Français', en: 'French' },
  { code: 'pt', name: 'Português', en: 'Portuguese' },
  { code: 'ja', name: '日本語', en: 'Japanese' },
];

export function StepLanguages({ native, onChange }: Props) {
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
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>
        We'll generate exercises in this language for you to translate.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LANGS.map((l) => {
          const on = native === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onChange(l.code)}
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
          marginTop: 22,
          padding: '14px 16px',
          background: T.surface2,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              fontFamily: T.fontMono,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Learning
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>English</div>
        </div>
        <Chip tone="ink" size="sm">
          Locked for v0.1
        </Chip>
      </div>
    </div>
  );
}
