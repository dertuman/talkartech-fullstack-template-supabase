import '@/styles/globals.css';
import 'flag-icons/css/flag-icons.min.css';

import { fontSans } from '@/lib/fonts';
import { getLocale } from '@/lib/i18n';
import { generateDefaultMetadata } from '@/lib/metadata-utils';
import { isAppConfigured } from '@/lib/setup/config';
import { isSetupSkipped } from '@/lib/setup/skip-cookie';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

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

/**
 * Configured shell — loaded dynamically to avoid importing @clerk/nextjs
 * at module level (which crashes when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing).
 */
async function ConfiguredBody({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { ClerkProvider } = await import('@clerk/nextjs');
  const { UserDataProvider } = await import('@/context/UserDataContext');
  const { I18nProviderClient } = await import('@/locales/client');
  const { default: ReactQueryProvider } = await import(
    '@/components/react-query-provider'
  );
  const { SiteHeader } = await import('@/components/site-header');
  const { ConditionalFooter } = await import('@/components/conditional-footer');
  const { TailwindIndicator } = await import('@/components/tailwind-indicator');

  return (
    <ClerkProvider>
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <I18nProviderClient locale={locale}>
            <UserDataProvider>
              <div className="relative flex min-h-dvh flex-col">
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
    </ClerkProvider>
  );
}

/**
 * Preview shell — used when the user skips setup to preview the site.
 * Provides I18n + Theme (both work without external services) but
 * does NOT load Clerk, React Query, or UserDataProvider.
 */
async function PreviewBody({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { I18nProviderClient } = await import('@/locales/client');
  const { PreviewSiteHeader } = await import(
    '@/components/preview-site-header'
  );
  const { SiteFooter } = await import('@/components/site-footer');
  const { SetupBanner } = await import('@/components/setup-banner');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <I18nProviderClient locale={locale}>
        <div className="relative flex min-h-dvh flex-col">
          <SetupBanner />
          <PreviewSiteHeader />
          <div className="flex flex-1 flex-col items-center">
            {children}
          </div>
          <SiteFooter />
        </div>
        <Toaster />
      </I18nProviderClient>
    </ThemeProvider>
  );
}

/**
 * Setup shell — used during initial setup before any external services
 * are configured. Provides I18n + Theme so the setup wizard can use
 * translated strings.
 */
async function SetupBody({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { I18nProviderClient } = await import('@/locales/client');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <I18nProviderClient locale={locale}>
        <div className="relative flex min-h-dvh flex-col">
          <div className="flex flex-1 flex-col items-center">
            {children}
          </div>
        </div>
        <Toaster />
      </I18nProviderClient>
    </ThemeProvider>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const configured = isAppConfigured();
  const skipped = !configured && (await isSetupSkipped());

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        {configured && (
          <>
            <link rel="shortcut icon" href="/favicon-16x16.png" />
            <link rel="apple-touch-icon" href="/favicon-16x16.png" />
            <link rel="manifest" href="/manifest.json" />
          </>
        )}
        <meta
          name="theme-color"
          content="oklch(0.145 0 0)"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="oklch(1 0 0)"
          media="(prefers-color-scheme: light)"
        />
        {configured && (
          <>
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="default"
            />
            <meta name="apple-mobile-web-app-title" content="Project" />
            <meta name="mobile-web-app-capable" content="yes" />
          </>
        )}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body
        className={cn(
          'custom-scrollbar min-h-dvh bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        {configured ? (
          <ConfiguredBody locale={locale}>{children}</ConfiguredBody>
        ) : skipped ? (
          <PreviewBody locale={locale}>{children}</PreviewBody>
        ) : (
          <SetupBody locale={locale}>{children}</SetupBody>
        )}
      </body>
    </html>
  );
}
