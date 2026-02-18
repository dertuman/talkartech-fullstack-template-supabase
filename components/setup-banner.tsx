'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
import { Settings } from 'lucide-react';

/**
 * Persistent banner shown at the top of every page when the user
 * has skipped setup. Hides itself on the /setup page.
 */
export function SetupBanner() {
  const pathname = usePathname();
  const t = useScopedI18n('setup');

  // Don't show the banner when the user is already on the setup page
  if (pathname.startsWith('/setup')) return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 border-b border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
      <Settings className="size-4" />
      <span>
        {t('bannerIncomplete')}{' '}
        <Link
          href="/setup"
          className="font-semibold underline underline-offset-4 hover:text-primary/80"
        >
          {t('bannerFinish')}
        </Link>{' '}
        {t('bannerDescription')}
      </span>
    </div>
  );
}
