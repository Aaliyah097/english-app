import { theme as T } from '../../theme';

export function StepWelcome() {
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
          fontSize: 42,
          lineHeight: 1.02,
          letterSpacing: -0.8,
          marginBottom: 18,
        }}
      >
        Learn English
        <br />
        through the things
        <br />
        <em style={{ color: T.accent }}>you already know.</em>
      </div>

      <div style={{ fontSize: 15.5, color: T.ink2, lineHeight: 1.5, marginBottom: 36 }}>
        Practice grammar by translating real sentences from your work — backend, design,
        business, anything. We correct, explain, and save the useful phrases for later.
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
          Sample exercise
        </div>
        <div style={{ color: T.ink2, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>
          Этот сервис читает сообщения из Kafka и сохраняет их в базе данных.
        </div>
        <div style={{ height: 0.5, background: T.border, margin: '12px -18px' }} />
        <div style={{ color: T.ink, fontSize: 14, lineHeight: 1.4 }}>
          This service{' '}
          <span style={{ color: T.accent, fontWeight: 500 }}>reads</span> messages from Kafka
          and <span style={{ color: T.accent, fontWeight: 500 }}>stores</span> them in the
          database.
        </div>
      </div>
    </div>
  );
}
