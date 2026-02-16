'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Loader } from '@/components/ui/loader';

import { PasswordResetForm } from './password-reset-form';

function PasswordResetContent() {
  const t = useScopedI18n('passwordReset');
  const [token, setToken] = React.useState('');
  const [email, setEmail] = React.useState('');
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const urlToken = searchParams?.get('token');
    const urlEmail = searchParams?.get('email');

    setToken(urlToken || '');
    setEmail(urlEmail || '');
  }, [searchParams]);

  const { data: verified, isLoading } = useQuery({
    queryKey: ['verifyPasswordReset', token],
    queryFn: async () => {
      if (token.length === 0) return false;
      try {
        await axios.post('/api/users/verify-password-reset', { token });
        return true;
      } catch (error) {
        console.error('Password reset verification failed:', error);
        return false;
      }
    },
    enabled: token.length > 0,
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <h1 className="mb-9 select-none text-4xl font-extrabold">
        {t('header')}
      </h1>
      <PasswordResetForm verified={verified ?? false} email={email} />
      <Link href="/login" className="mt-4 underline">
        {t('backToLogin')}
      </Link>
    </main>
  );
}

export default function PasswordReset() {
  const tCommon = useScopedI18n('common');

  return (
    <Suspense fallback={<>{tCommon('loading')}</>}>
      <PasswordResetContent />
    </Suspense>
  );
}
