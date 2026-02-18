/**
 * Server-side helper to read the "setup-skipped" cookie.
 * Used by layout.tsx to decide whether to render the PreviewBody
 * (header + footer without Clerk/Supabase) or the bare setup shell.
 */
import { cookies } from 'next/headers';

export const SETUP_SKIPPED_COOKIE = 'setup-skipped';

export async function isSetupSkipped(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SETUP_SKIPPED_COOKIE)?.value === '1';
}
