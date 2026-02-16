import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getScopedI18n } from '@/locales/server';

import { Separator } from '@/components/ui/separator';

import { ProfileForm } from './profile-form';

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session) redirect('/login');
  const t = await getScopedI18n('profile');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('profile')}</h3>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
