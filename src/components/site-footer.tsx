import { getTranslations } from 'next-intl/server';

import { siteConfig } from '@/lib/site';

export async function SiteFooter() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t('rights', {
            year: new Date().getFullYear(),
            name: siteConfig.name,
          })}
        </p>
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {t('contact')}
        </a>
      </div>
    </footer>
  );
}
