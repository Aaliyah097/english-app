import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Default settings — Next.js handles everything we need. Static assets in
  // /public ship as-is; app/api/* becomes serverless functions; app/page.tsx
  // becomes the single SPA-style entrypoint.
};

export default nextConfig;
