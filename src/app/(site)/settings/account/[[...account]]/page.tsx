import type { Metadata } from 'next';
import { UserProfile } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

import { requireUserId } from '@/lib/auth';

import { SectionHeader } from '../../section-header';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('settings.account');
  return { title: t('title') };
}

/** Clerk's hosted account management: emails, password, MFA, sessions. */
export default async function AccountPage() {
  await requireUserId();
  const t = await getTranslations('settings.account');

  return (
    <section>
      <SectionHeader title={t('title')} description={t('description')} />
      <UserProfile
        routing="path"
        path="/settings/account"
        appearance={{
          elements: {
            rootBox: 'w-full',
            cardBox: 'w-full max-w-none shadow-none border',
          },
        }}
      />
    </section>
  );
}
