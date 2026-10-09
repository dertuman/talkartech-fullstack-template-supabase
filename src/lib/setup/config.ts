import { env } from '@/env';

/**
 * Whether Clerk and Supabase credentials are present. When they are not, the
 * app runs in setup mode: the proxy sends visitors to /setup (or to a preview
 * of the site if they chose to skip setup).
 */
export function isAppConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    env.CLERK_SECRET_KEY &&
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * The setup API writes files and talks to GitHub and Vercel with tokens you
 * paste in, so it only ever runs on your machine.
 */
export function isSetupApiEnabled(): boolean {
  return env.NODE_ENV === 'development' && !isAppConfigured();
}
