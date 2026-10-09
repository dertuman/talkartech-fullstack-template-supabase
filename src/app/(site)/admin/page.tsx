import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isLocale, localeNames } from '@/i18n/config';
import { requireUserId } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('title'), robots: { index: false } };
}

/**
 * Example of an admin-only page. Access is enforced twice: here (404 for
 * non-admins) and in the database, where the "Admins can read all profiles"
 * policy is what makes the query below return other users at all.
 */
export default async function AdminPage() {
  await requireUserId();
  const me = await getCurrentProfile();
  if (me?.role !== 'admin') notFound();

  const t = await getTranslations('admin');
  const format = await getFormatter();

  const { data: profiles, error } = await createClient()
    .from('profiles')
    .select('id, role, locale, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({
    userId: profiles.map((p) => p.id),
    limit: 100,
  });
  const usersById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      {profiles.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('language')}</TableHead>
                <TableHead className="text-right">{t('joined')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const user = usersById.get(profile.id);
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user?.fullName || profile.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          profile.role === 'admin' ? 'default' : 'secondary'
                        }
                      >
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isLocale(profile.locale)
                        ? localeNames[profile.locale]
                        : profile.locale}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {format.dateTime(new Date(profile.created_at), {
                        dateStyle: 'medium',
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
