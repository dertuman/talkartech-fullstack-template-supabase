'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { setConsent } from '@/lib/actions/preferences';
import type { ConsentValue } from '@/lib/cookies';

/**
 * Shown only when analytics are configured and the visitor has not chosen
 * yet. Analytics scripts are not loaded until they accept.
 */
export function CookieBanner() {
  const t = useTranslations('cookies');
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();

  if (hidden) return null;

  const choose = (value: ConsentValue) =>
    startTransition(async () => {
      await setConsent(value);
      setHidden(true);
      router.refresh();
    });

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-lg border bg-card p-4 text-card-foreground shadow-lg"
    >
      <h2 id="cookie-banner-title" className="font-medium">
        {t('title')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => choose('essential')}
        >
          {t('reject')}
        </Button>
        <Button disabled={pending} onClick={() => choose('all')}>
          {t('accept')}
        </Button>
      </div>
    </section>
  );
}
