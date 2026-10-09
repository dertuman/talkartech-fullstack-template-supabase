import { describe, expect, it } from 'vitest';

import { isLocale, matchLocale } from './config';

describe('matchLocale', () => {
  it('falls back to the default locale without a header', () => {
    expect(matchLocale(null)).toBe('en');
    expect(matchLocale('')).toBe('en');
  });

  it('matches a region-specific tag to its language', () => {
    expect(matchLocale('es-MX,es;q=0.9')).toBe('es');
  });

  it('honours quality values over header order', () => {
    expect(matchLocale('en;q=0.5,es;q=0.9')).toBe('es');
  });

  it('skips unsupported languages', () => {
    expect(matchLocale('fr-FR,fr;q=0.9,es;q=0.8')).toBe('es');
    expect(matchLocale('de,fr')).toBe('en');
  });

  it('ignores languages the browser explicitly rejects', () => {
    expect(matchLocale('es;q=0,en;q=0.1')).toBe('en');
  });
});

describe('isLocale', () => {
  it('only accepts supported locales', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
