import { NextResponse } from 'next/server';

/**
 * POST /api/setup/skip
 * Sets an httpOnly cookie that tells the middleware + layout
 * the user chose to skip setup and preview the site.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('setup-skipped', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}
