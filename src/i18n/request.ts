import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { isLocale, LOCALE_COOKIE, matchLocale } from './config';

/**
 * Locale resolution without locale-prefixed URLs: an explicit choice (cookie)
 * wins, then the browser's Accept-Language header, then the default.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale((await headers()).get('accept-language'));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
