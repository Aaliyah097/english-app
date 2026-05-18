// Client-only entry. The app reads from localStorage in its initial
// render path, so we delay mounting until after hydration when `window`
// is available. The static HTML the server emits is empty — that's
// fine, the whole app is local-first.

'use client';

import { useEffect, useState } from 'react';
import { App } from '../src/App';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <App />;
}
