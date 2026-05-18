// Trivial health probe — confirms the route handler infra works.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ ok: true });
}
