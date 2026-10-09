export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Cookie next-intl and the locale switcher share. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Each language named in itself, so people can always find their own. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}

/**
 * Picks the best supported locale from an Accept-Language header, honouring
 * q-values. Falls back to the default locale.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return {
        language: tag.toLowerCase().split('-')[0],
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  return (
    (ranked.find((entry) => isLocale(entry.language))?.language as
      Locale | undefined) ?? defaultLocale
  );
}
