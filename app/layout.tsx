import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

// Root HTML wrapper. Replaces the old index.html — Next.js renders this
// once for every route and lets us declare metadata, fonts, and PWA hints
// here instead of in raw HTML.

export const metadata: Metadata = {
  title: 'Englishly',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'Englishly',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#faf9f6',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — same set the app used under Vite. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;1,400;1,500&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap"
        />
        <style>{`
          html, body, #__next { height: 100%; margin: 0; }
          body { background: #faf9f6; -webkit-font-smoothing: antialiased; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
