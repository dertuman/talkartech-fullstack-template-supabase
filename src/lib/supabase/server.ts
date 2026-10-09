import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { env } from '@/env';

import type { Database } from './database.types';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers,
 * authenticated as the signed-in Clerk user. Every query runs through RLS
 * with `auth.jwt() ->> 'sub'` set to the Clerk user id.
 */
export function createClient() {
  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error('Supabase is not configured. Run the /setup wizard.');
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      accessToken: async () => (await auth()).getToken(),
    }
  );
}
