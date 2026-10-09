import 'server-only';

import { NextResponse } from 'next/server';

import { isSetupApiEnabled } from './config';

/**
 * Returns a 404 response unless the setup API is allowed to run (local
 * development, app not yet configured). Usage:
 *
 *   const blocked = guardSetupApi();
 *   if (blocked) return blocked;
 */
export function guardSetupApi(): NextResponse | null {
  if (isSetupApiEnabled()) return null;
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
