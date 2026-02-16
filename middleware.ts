import { NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';

export const locales = ['en', 'es'] as const;
export const localeLabels = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
];
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en';

const I18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale,
  urlMappingStrategy: 'rewriteDefault',
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - .*\\..*$ (files with extensions, e.g., favicon.ico)
    // - manifest.json
    // - service-worker.js, sw.js
    '/((?!api|_next|.*\\..*|manifest\\.json|service-worker\\.js|sw\\.js).*)',
  ],
};
