import 'server-only';

import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';

import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

/**
 * The signed-in user's profile, or null when signed out. Deduplicated per
 * request with React `cache`, so layouts and pages can all call it freely.
 *
 * Creates the row on first visit, so the app never depends on the Clerk
 * webhook having arrived. RLS only lets a user insert their own id.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })
    .select('*')
    .maybeSingle();

  if (insertError) throw insertError;
  if (created) return created;

  // Lost a race with the webhook or a parallel request: the row exists now.
  const { data: existing, error: retryError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (retryError) throw retryError;
  return existing;
});
