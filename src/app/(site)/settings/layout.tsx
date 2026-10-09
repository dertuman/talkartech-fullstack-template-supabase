import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { routes } from '@/lib/routes';

import { SettingsNav } from './settings-nav';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('settings');
  return { title: t('title') };
}

export default async function SettingsLayout({
  children,
}: LayoutProps<'/settings'>) {
  const t = await getTranslations('settings');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-56 lg:shrink-0">
          <SettingsNav
            items={[
              { href: '/settings', label: t('nav.profile') },
              { href: '/settings/preferences', label: t('nav.preferences') },
              { href: routes.account, label: t('nav.account') },
            ]}
          />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
