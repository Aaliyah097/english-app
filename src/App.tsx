import { lazy, Suspense } from 'react';
import { theme as T } from './theme';

// Dev-only playground. In prod builds, the if-branch is dead code and Vite
// tree-shakes the dynamic import away, so the playground bundle never ships.
const Playground = import.meta.env.DEV ? lazy(() => import('./ui/__playground').then((m) => ({ default: m.Playground }))) : null;

export function App() {
  if (Playground) {
    return (
      <Suspense fallback={<Wordmark />}>
        <Playground />
      </Suspense>
    );
  }
  return <Wordmark />;
}

function Wordmark() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        color: T.ink,
        display: 'grid',
        placeItems: 'center',
        fontFamily: T.fontBody,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: T.fontDisplay,
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
            fontFamily: T.fontMono,
            fontSize: 11,
            color: T.muted,
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
