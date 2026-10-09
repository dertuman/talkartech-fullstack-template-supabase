import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserId } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile';
import type { Theme } from '@/lib/validation/profile';

import { SectionHeader } from '../section-header';
import { PreferencesForm } from './preferences-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('settings.preferences');
  return { title: t('title') };
}

export default async function PreferencesPage() {
  await requireUserId();
  const t = await getTranslations('settings.preferences');
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Profile not found');

  return (
    <section className="max-w-2xl">
      <SectionHeader title={t('title')} description={t('description')} />
      <PreferencesForm theme={profile.theme as Theme} />
    </section>
  );
}
