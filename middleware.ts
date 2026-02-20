import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SETUP_SKIPPED_COOKIE } from '@/lib/setup/skip-cookie';

/** Routes that require Clerk and must be blocked in preview/unconfigured mode. */
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/profile'];

/**
 * Check if the app is configured by looking at env vars directly.
 * Inlined here to keep the middleware dependency tree minimal for Edge Runtime.
 */
function isConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

/**
 * Middleware handles setup redirects only.
 *
 * Auth protection (Clerk) is handled at the page/layout level via auth()
 * rather than here, because Clerk's middleware uses eval() which is blocked
 * by the Edge Runtime on many hosting providers.
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow setup routes and setup API through
  if (
    pathname.startsWith('/setup') ||
    pathname.startsWith('/api/setup')
  ) {
    return NextResponse.next();
  }

  const configured = isConfigured();

  if (configured) {
    // Block /setup when already configured
    if (pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Not configured — check if user chose to preview
  const setupSkipped =
    req.cookies.get(SETUP_SKIPPED_COOKIE)?.value === '1';

  if (setupSkipped) {
    // Block auth-dependent routes that would crash without Clerk
    if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      const url = new URL('/', req.url);
      url.searchParams.set('setup', 'required');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Not configured and not skipped — redirect everything to /setup
  return NextResponse.redirect(new URL('/setup', req.url));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
