'use client';

import { useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/env';

import type { Database } from './database.types';

/**
 * Supabase client for Client Components, authenticated as the signed-in Clerk
 * user. Prefer fetching in Server Components and mutating in Server Actions;
 * reach for this for realtime subscriptions or client-only interactions.
 */
export function useSupabase() {
  const { session } = useSession();

  return useMemo(() => {
    if (
      !env.NEXT_PUBLIC_SUPABASE_URL ||
      !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      throw new Error('Supabase is not configured. Run the /setup wizard.');
    }

    return createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { accessToken: async () => (await session?.getToken()) ?? null }
    );
  }, [session]);
}
