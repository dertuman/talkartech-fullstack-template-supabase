import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

import { isAppConfigured } from '@/lib/setup/config';
import { SETUP_SKIPPED_COOKIE } from '@/lib/setup/skip-cookie';

/** Routes that require Clerk and must be blocked in preview mode. */
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/profile'];

export default async function middleware(
  req: NextRequest,
  evt: NextFetchEvent
) {
  const configured = isAppConfigured();

  if (!configured) {
    const { pathname } = req.nextUrl;

    // Always allow setup routes and setup API through
    if (
      pathname.startsWith('/setup') ||
      pathname.startsWith('/api/setup')
    ) {
      return NextResponse.next();
    }

    const setupSkipped =
      req.cookies.get(SETUP_SKIPPED_COOKIE)?.value === '1';

    if (setupSkipped) {
      // User chose to preview the site — allow public routes through
      // but block auth-dependent routes that would crash without Clerk
      if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
        const url = new URL('/', req.url);
        url.searchParams.set('setup', 'required');
        return NextResponse.redirect(url);
      }

      // Allow everything else (home, about, etc.)
      return NextResponse.next();
    }

    // Not configured and not skipped — redirect everything to /setup
    return NextResponse.redirect(new URL('/setup', req.url));
  }

  // App is configured — use Clerk middleware
  // Dynamic import to avoid assertKey() crash when keys are missing
  const { clerkMiddleware, createRouteMatcher } = await import(
    '@clerk/nextjs/server'
  );

  const isProtectedRoute = createRouteMatcher(['/profile(.*)']);

  const handler = clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }

    // Block /setup when already configured
    if (request.nextUrl.pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  });

  return handler(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
