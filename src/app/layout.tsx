import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { enUS, esES } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cn } from 'cn';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { CookieBanner } from '@/components/cookie-banner';
import { Providers } from '@/components/providers';
import { env } from '@/env';
import type { Locale } from '@/i18n/config';
import { CONSENT_COOKIE } from '@/lib/cookies';
import { routes } from '@/lib/routes';
import { isAppConfigured } from '@/lib/setup/config';
import { getSiteUrl, siteConfig } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const clerkLocalizations = { en: enUS, es: esES } satisfies Record<
  Locale,
  unknown
>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    metadataBase: getSiteUrl(),
    title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
    description: t('description'),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitterHandle,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = (await getLocale()) as Locale;
  const consent = (await cookies()).get(CONSENT_COOKIE)?.value;
  const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const document = (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-dvh bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <NextIntlClientProvider>
          <Providers>
            {children}
            {gaId && !consent && <CookieBanner />}
          </Providers>
        </NextIntlClientProvider>
        {gaId && consent === 'all' && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );

  // Without credentials the app runs in setup mode, so Clerk is left out.
  if (!isAppConfigured()) return document;

  return (
    <ClerkProvider
      localization={clerkLocalizations[locale]}
      signInUrl={routes.signIn}
      signUpUrl={routes.signUp}
    >
      {document}
    </ClerkProvider>
  );
}
