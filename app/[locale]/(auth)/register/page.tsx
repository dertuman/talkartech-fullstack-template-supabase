import { Metadata } from 'next';
import Link from 'next/link';
import { getScopedI18n } from '@/locales/server';
import { setStaticParamsLocale } from 'next-international/server';

import { API_BASE_URL } from '@/lib/constants';

import RegistrationForm from './registration-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getScopedI18n('register');

  return {
    metadataBase: new URL(API_BASE_URL),
    title: t('metaData.title'),
    description: t('metaData.description'),
    openGraph: {
      type: 'website',
      locale: t('metaData.openGraph.locale'),
      url: API_BASE_URL,
      title: t('metaData.title'),
      description: t('metaData.description'),
      siteName: 'PROJECT',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: 'PROJECT',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@PROJECT',
      title: t('metaData.title'),
      description: t('metaData.description'),
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: 'PROJECT',
        },
      ],
    },
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getScopedI18n('register');
  const tCommon = await getScopedI18n('common');

  return (
    <main className="flex h-[calc(100vh-4.1rem)] flex-col items-center justify-center bg-background">
      <h1 className="mb-9 select-none text-4xl font-extrabold">
        {t('header')}
      </h1>
      <RegistrationForm />
      <Link href="/login">
        ← <span className="underline">{tCommon('login')}</span>
      </Link>
    </main>
  );
}
