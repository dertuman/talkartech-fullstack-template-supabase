import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { Database, FlaskConical, ImageUp, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { isAppConfigured } from '@/lib/setup/config';

const FEATURES = [
  { key: 'auth', icon: ShieldCheck },
  { key: 'database', icon: Database },
  { key: 'storage', icon: ImageUp },
  { key: 'quality', icon: FlaskConical },
] as const;

export default async function HomePage() {
  const t = await getTranslations('home');
  const configured = isAppConfigured();
  const user = configured ? await currentUser() : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 md:py-24">
      <section className="flex max-w-2xl flex-col gap-6">
        {user?.firstName && (
          <p className="text-muted-foreground">
            {t('welcomeBack', { name: user.firstName })}
          </p>
        )}
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          {t('title')}
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">
          {t('subtitle')}
        </p>
        <div className="flex gap-3">
          {user ? (
            <Button size="lg" asChild>
              <Link href="/settings">{t('openSettings')}</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href={configured ? routes.signUp : '/setup'}>
                {t('getStarted')}
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
        {FEATURES.map(({ key, icon: Icon }) => (
          <div key={key} className="flex flex-col gap-2 bg-background p-6">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
            <h2 className="font-medium">{t(`features.${key}.title`)}</h2>
            <p className="text-sm text-muted-foreground">
              {t(`features.${key}.description`)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
