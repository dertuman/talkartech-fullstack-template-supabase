import { env } from '@/env';

/** Edit these once when you start a new project. */
export const siteConfig = {
  name: 'PROJECT',
  description: 'A production-ready Next.js, Clerk and Supabase starter.',
  twitterHandle: '@PROJECT',
  supportEmail: 'support@example.com',
};

/** Absolute origin of the site, used for metadata, sitemaps and redirects. */
export function getSiteUrl(): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL('http://localhost:3000');
}
