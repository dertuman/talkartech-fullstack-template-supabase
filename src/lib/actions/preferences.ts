'use server';

import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

import { isLocale, LOCALE_COOKIE } from '@/i18n/config';
import { ok, unexpected, type ActionResult } from '@/lib/action-result';
import { CONSENT_COOKIE, isConsentValue, ONE_YEAR } from '@/lib/cookies';
import { isAppConfigured } from '@/lib/setup/config';
import { createClient } from '@/lib/supabase/server';
import { THEMES, type Theme } from '@/lib/validation/profile';

/** Switches the UI language, and remembers it on the profile when signed in. */
export async function setLocale(locale: string): Promise<ActionResult> {
  if (!isLocale(locale)) return { ok: false, error: 'invalidInput' };

  (await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  });

  if (!isAppConfigured()) return ok();

  const { userId } = await auth();
  if (!userId) return ok();

  const { error } = await createClient()
    .from('profiles')
    .update({ locale })
    .eq('id', userId);

  return error ? unexpected(error) : ok();
}

/** Records the visitor's cookie choice. Analytics only load after 'all'. */
export async function setConsent(value: string): Promise<ActionResult> {
  if (!isConsentValue(value)) return { ok: false, error: 'invalidInput' };

  (await cookies()).set(CONSENT_COOKIE, value, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  });
  return ok();
}

/** Remembers the theme on the profile so it follows the user across devices. */
export async function setThemePreference(theme: string): Promise<ActionResult> {
  if (!(THEMES as readonly string[]).includes(theme)) {
    return { ok: false, error: 'invalidInput' };
  }
  if (!isAppConfigured()) return ok();

  const { userId } = await auth();
  if (!userId) return ok();

  const { error } = await createClient()
    .from('profiles')
    .update({ theme: theme as Theme })
    .eq('id', userId);

  return error ? unexpected(error) : ok();
}
