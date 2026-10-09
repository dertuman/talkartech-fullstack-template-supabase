import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** Shown on every page while previewing the site without credentials. */
export async function SetupBanner() {
  const t = await getTranslations('setup');

  return (
    <div className="border-b bg-muted px-4 py-2 text-center text-sm">
      {t('bannerIncomplete')}{' '}
      <Link href="/setup" className="font-medium underline underline-offset-4">
        {t('bannerFinish')}
      </Link>{' '}
      {t('bannerDescription')}
    </div>
  );
}
