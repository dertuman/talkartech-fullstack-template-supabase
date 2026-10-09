import 'server-only';

import { auth } from '@clerk/nextjs/server';

/**
 * Call at the top of every page, layout or route that needs a signed-in user.
 * Redirects to sign-in for page requests (404 for others) and returns the
 * Clerk user id. Checks live next to the data they protect rather than in the
 * proxy, so they cannot drift from how Next.js resolves routes.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}
