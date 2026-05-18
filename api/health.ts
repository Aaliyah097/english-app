// Trivial health probe — no imports, no I/O, synchronous response.
// If GET /api/health returns 200 "ok" instantly, the Vercel function
// infrastructure works and the tutor.ts hang is specific to that handler.
// If /api/health also times out, the issue is at the project / runtime
// level, not in tutor.ts.

export default function handler(): Response {
  return new Response('ok', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
