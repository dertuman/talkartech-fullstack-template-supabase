import { SetupBanner } from '@/components/setup-banner';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ThemeSync } from '@/components/theme-sync';
import { getCurrentProfile } from '@/lib/profile';
import { isAppConfigured } from '@/lib/setup/config';
import type { Profile } from '@/lib/supabase/types';
import type { Theme } from '@/lib/validation/profile';

async function loadProfile(): Promise<Profile | null> {
  try {
    return await getCurrentProfile();
  } catch (error) {
    // Keep public pages up if the database is unreachable or not migrated.
    console.error('Failed to load profile', error);
    return null;
  }
}

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const configured = isAppConfigured();
  const profile = configured ? await loadProfile() : null;

  return (
    <div className="flex min-h-dvh flex-col">
      {!configured && <SetupBanner />}
      <SiteHeader configured={configured} profile={profile} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
      {profile && <ThemeSync theme={profile.theme as Theme} />}
    </div>
  );
}
