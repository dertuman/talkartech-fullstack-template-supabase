import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { locales } from '@/i18n/config';

import en from './en.json';

type Messages = { [key: string]: string | Messages };

function keys(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [`${prefix}${key}`]
      : keys(value, `${prefix}${key}.`)
  );
}

describe('translations', () => {
  const reference = keys(en).sort();

  it.each(locales.filter((locale) => locale !== 'en'))(
    '%s has exactly the same keys as en',
    (locale) => {
      const file = new URL(`./${locale}.json`, import.meta.url);
      const messages = JSON.parse(readFileSync(file, 'utf8')) as Messages;
      expect(keys(messages).sort()).toEqual(reference);
    }
  );
});
