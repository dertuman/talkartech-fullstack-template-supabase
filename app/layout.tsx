import '@/styles/globals.css';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ClerkProvider } from '@clerk/nextjs';
import { UserDataProvider } from '@/context/UserDataContext';
import { I18nProviderClient } from '@/locales/client';
import { getLocale } from '@/lib/i18n';

import { fontSans } from '@/lib/fonts';
import { generateDefaultMetadata } from '@/lib/metadata-utils';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ConditionalFooter } from '@/components/conditional-footer';
import ReactQueryProvider from '@/components/react-query-provider';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';

const AnimatedBackground = dynamic(
  () =>
    import('@/components/animated-background').then(
      (mod) => mod.AnimatedBackground
    ),
  {
    loading: () => null,
  }
);

export async function generateMetadata() {
  return generateDefaultMetadata({
    currentLocale: 'en',
    path: '/',
    translations: {
      title: 'PROJECT',
      description: 'Discover PROJECT, the ultimate platform.',
      ogLocale: 'en',
      ogSiteName: 'PROJECT',
      imageAlt: 'PROJECT',
      twitterSite: '@PROJECT',
    },
  });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#020817" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Project" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </head>
        <body
          className={cn(
            'custom-scrollbar min-h-dvh font-sans antialiased',
            fontSans.variable
          )}
        >
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <I18nProviderClient locale={locale}>
                <UserDataProvider>
                  <div className="relative flex min-h-dvh flex-col">
                    <Suspense fallback={null}>
                      <AnimatedBackground />
                    </Suspense>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col items-center">
                      {children}
                    </div>
                    <ConditionalFooter />
                  </div>
                  <TailwindIndicator />
                  <Toaster />
                </UserDataProvider>
              </I18nProviderClient>
            </ThemeProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
