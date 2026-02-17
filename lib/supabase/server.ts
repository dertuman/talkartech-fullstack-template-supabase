import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

export async function createClerkSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export function createSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
