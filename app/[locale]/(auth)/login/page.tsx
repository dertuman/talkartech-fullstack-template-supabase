import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getScopedI18n } from '@/locales/server';
import { setStaticParamsLocale } from 'next-international/server';

import { API_BASE_URL } from '@/lib/constants';

import LoginForm from './login-form';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(API_BASE_URL),
    title: 'PROJECT - Login',
    description: 'Login',
    openGraph: {
      type: 'website',
      locale: 'en',
      url: API_BASE_URL,
      title: 'PROJECT - Login',
      description: 'Login',
      siteName: 'PROJECT',
      images: [
        {
          url: 'https://placehold.co/400',
          width: 1200,
          height: 630,
          alt: 'PROJECT - Login',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@PROJECT',
      title: 'PROJECT - Login',
      description: 'Login',
      images: [
        {
          url: 'https://placehold.co/400',
          width: 1200,
          height: 630,
          alt: 'PROJECT - Login',
        },
      ],
    },
  };
}

export default async function Login({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getScopedI18n('login');
  const tCommon = await getScopedI18n('common');

  return (
    <main className="flex min-h-[calc(100dvh-64px)] flex-1 flex-col items-center justify-center">
      <h1 className="mb-9 select-none text-4xl font-extrabold">
        {t('header')}
      </h1>
      <Suspense fallback={<>{tCommon('loading')}</>}>
        <LoginForm />
      </Suspense>
      <Link href="/register" className="underline">
        {tCommon('register')}
      </Link>
    </main>
  );
}
