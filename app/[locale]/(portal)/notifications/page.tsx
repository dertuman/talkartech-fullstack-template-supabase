import { redirect } from 'next/navigation';
import { auth } from '@/auth';

import { NotificationsList } from './notifications-list';

export default async function Notifications() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <main className="bg flex flex-1 flex-col items-center justify-center">
      <NotificationsList />
    </main>
  );
}
