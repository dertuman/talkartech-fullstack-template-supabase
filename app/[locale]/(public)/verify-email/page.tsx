'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useScopedI18n('emailVerification');
  const tCommon = useScopedI18n('common');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    setToken(urlToken || '');
  }, [searchParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: async () => {
      if (!token) return null;
      const response = await axios.post('/api/users/verify-email', { token });
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      router.push('/login?justVerified=true');
    }
  }, [data, router]);

  return (
    <main className="bg flex flex-1 flex-col items-center justify-center space-y-5">
      <h1 className="text-4xl">{t('emailVerified')}</h1>
      {isLoading && <h2 className="text-lg">{tCommon('loading')}</h2>}
      {!isLoading && (
        <h2 className="text-lg">{token ? `${token}` : 'no token'}</h2>
      )}

      {data && (
        <div>
          <h2 className="text-2xl">{t('emailVerified')}</h2>
          <Link href="/login">{tCommon('login')}</Link>
        </div>
      )}
      {isError && (
        <div>
          <h2 className="text-xl text-red-500">
            {(error as any)?.response?.data?.error || 'An error occurred'}
          </h2>
        </div>
      )}
    </main>
  );
}
