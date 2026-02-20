import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

import { SETUP_SKIPPED_COOKIE } from '@/lib/setup/skip-cookie';

/** Routes that require Clerk and must be blocked in preview mode. */
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/profile'];

/**
 * Check if the app is configured by looking at env vars directly.
 * Inlined here instead of importing from config.ts to keep the middleware
 * dependency tree minimal for Edge Runtime.
 */
function isConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

export default async function middleware(
  req: NextRequest,
  evt: NextFetchEvent
) {
  const configured = isConfigured();

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
  // Dynamic import wrapped in try-catch to handle Edge Runtime eval errors
  try {
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
  } catch {
    // Clerk import failed in Edge Runtime — let the request through
    // The page-level auth checks will still protect routes
    return NextResponse.next();
  }
}

export const config = {
  // Allow Clerk's dynamic code in Edge Runtime (it uses eval internally)
  unstable_allowDynamic: [
    '/node_modules/@clerk/**',
    '/node_modules/mime/**',
  ],
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
