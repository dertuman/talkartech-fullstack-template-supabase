import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';

import { requireUserId } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile';

import { AvatarForm } from './avatar-form';
import { ProfileForm } from './profile-form';
import { SectionHeader } from './section-header';

export default async function ProfileSettingsPage() {
  await requireUserId();
  const t = await getTranslations('settings.profile');
  const [user, profile] = await Promise.all([
    currentUser(),
    getCurrentProfile(),
  ]);

  // The proxy guarantees a session; a missing profile here is a real error.
  if (!user || !profile) throw new Error('Profile not found');

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part!.charAt(0))
      .join('')
      .toUpperCase() || '?';

  return (
    <section className="max-w-2xl">
      <SectionHeader title={t('title')} description={t('description')} />
      <div className="flex flex-col gap-10">
        <AvatarForm url={profile.avatar_url} initials={initials} />
        <ProfileForm
          email={user.primaryEmailAddress?.emailAddress ?? ''}
          defaultValues={{
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            bio: profile.bio,
            dateOfBirth: profile.date_of_birth ?? '',
          }}
        />
      </div>
    </section>
  );
}
