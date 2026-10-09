import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/env';

import type { Database } from './database.types';

/**
 * Service-role client. Bypasses RLS entirely, so only use it for trusted
 * server-side work that has no user session (webhooks, cron jobs, scripts).
 */
export function createAdminClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_SECRET_KEY is not set.');
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
