import '@/styles/globals.css';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { UserDataProvider } from '@/context/UserDataContext';
import { I18nProviderClient } from '@/locales/client';
import { getScopedI18n, getStaticParams } from '@/locales/server';
import { setStaticParamsLocale } from 'next-international/server';

import { NEXT_PUBLIC_NODE_ENV } from '@/lib/constants';
import { fontSans } from '@/lib/fonts';
import { generateDefaultMetadata } from '@/lib/metadata-utils';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
// import { Analytics } from '@/components/analytics';
import { ConditionalFooter } from '@/components/conditional-footer';
import { PWAPrompt } from '@/components/pwa-prompt';
import ReactQueryProvider from '@/components/react-query-provider';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';

import { NextAuthProvider } from '../Provider';

const AnimatedBackground = dynamic(
  () =>
    import('@/components/animated-background').then(
      (mod) => mod.AnimatedBackground
    ),
  {
    loading: () => null,
  }
);

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Static params generation for all locales
export function generateStaticParams() {
  return getStaticParams();
}

export async function generateMetadata({
  params,
}: Omit<RootLayoutProps, 'children'>) {
  const { locale } = await params;
  const t = await getScopedI18n('common');

  return generateDefaultMetadata({
    currentLocale: locale,
    path: '/',
    translations: {
      title: t('siteName'),
      description: t('siteDescription'),
      ogLocale: locale,
      ogSiteName: t('siteName'),
      imageAlt: 'PROJECT',
      twitterSite: '@PROJECT',
    },
  });
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  // Set the locale for static rendering
  setStaticParamsLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020817" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Project" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />

        {/* Performance optimizations */}
        {/* <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.google-analytics.com"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body
        className={cn(
          'custom-scrollbar min-h-dvh font-sans antialiased',
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <I18nProviderClient locale={locale}>
                <UserDataProvider>
                  <NotificationsProvider>
                    <div className="relative flex min-h-dvh flex-col">
                      <Suspense fallback={null}>
                        <AnimatedBackground />
                      </Suspense>
                      <SiteHeader />
                      <div className="flex flex-1 flex-col items-center">
                        {children}
                      </div>
                      <ConditionalFooter />
                      {NEXT_PUBLIC_NODE_ENV !== 'development' && <PWAPrompt />}
                    </div>
                    <TailwindIndicator />
                    <Toaster />
                  </NotificationsProvider>
                </UserDataProvider>
              </I18nProviderClient>
            </ThemeProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
