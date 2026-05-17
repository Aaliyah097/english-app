// Warm, minimal design tokens — ported verbatim from ai/design/project/src/theme.js.
// Inline-style values reference theme.* so every screen draws from one source.

export const theme = {
  // Surfaces
  bg: '#faf9f6',
  surface: '#ffffff',
  surface2: '#f3f1ea',
  border: '#e7e3d8',
  borderStrong: '#d8d2c2',

  // Ink
  ink: '#1a1a1a',
  ink2: '#3d3a33',
  muted: '#8a857a',
  muted2: '#b3ac9c',

  // Accent (terracotta)
  accent: '#c8593e',
  accentInk: '#9c3e25',
  accentSoft: '#f5d9cf',
  accentBg: '#fbeae3',

  // Semantic
  good: '#5b7a4a',
  goodSoft: '#dfe6d2',
  warn: '#b8893c',
  warnSoft: '#f1e3c4',

  // Typography
  fontDisplay: '"Newsreader", "Iowan Old Style", Georgia, serif',
  fontBody:
    '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, "SF Mono", "JetBrains Mono", monospace',

  // Radii
  r1: 8,
  r2: 14,
  r3: 22,
  r4: 28,
} as const;

export type Theme = typeof theme;
