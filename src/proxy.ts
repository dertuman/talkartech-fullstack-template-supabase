import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

import { SETUP_SKIPPED_COOKIE } from '@/lib/cookies';
import { routes } from '@/lib/routes';
import { isAppConfigured } from '@/lib/setup/config';

/**
 * Clerk's middleware makes `auth()` available everywhere. It does not decide
 * who may see what: pages and actions check that themselves (see
 * src/lib/auth.ts). This proxy only routes between setup mode and the app.
 */
const authProxy = clerkMiddleware({
  signInUrl: routes.signIn,
  signUpUrl: routes.signUp,
});

/** Pages that cannot render until Clerk is configured. */
const CLERK_PAGES = ['/sign-in', '/sign-up', '/settings', '/admin'];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (isAppConfigured()) {
    if (startsWithAny(pathname, ['/setup'])) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return authProxy(req, event);
  }

  // Setup mode: no credentials yet.
  if (startsWithAny(pathname, ['/setup', '/api/setup', '/api/health'])) {
    return NextResponse.next();
  }

  if (req.cookies.get(SETUP_SKIPPED_COOKIE)?.value !== '1') {
    return NextResponse.redirect(new URL('/setup', req.url));
  }

  // Previewing without credentials.
  if (startsWithAny(pathname, CLERK_PAGES)) {
    const url = new URL('/', req.url);
    url.searchParams.set('setup', 'required');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
