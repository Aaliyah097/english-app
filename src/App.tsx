export function App() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#faf9f6',
        color: '#1a1a1a',
        display: 'grid',
        placeItems: 'center',
        fontFamily:
          '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: '"Newsreader", "Iowan Old Style", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 42,
            letterSpacing: -0.8,
            marginBottom: 8,
          }}
        >
          Englishly
        </div>
        <div
          style={{
            fontFamily: '"Geist Mono", ui-monospace, monospace',
            fontSize: 11,
            color: '#8a857a',
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          v0.1 · scaffolding
        </div>
      </div>
    </div>
  );
}
