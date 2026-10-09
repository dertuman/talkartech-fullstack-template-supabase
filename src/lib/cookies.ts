/** One year, in seconds. */
export const ONE_YEAR = 60 * 60 * 24 * 365;

/** Set when the visitor chooses to preview the site before finishing setup. */
export const SETUP_SKIPPED_COOKIE = 'setup-skipped';

export const CONSENT_COOKIE = 'cookie-consent';
export type ConsentValue = 'all' | 'essential';

export function isConsentValue(value: unknown): value is ConsentValue {
  return value === 'all' || value === 'essential';
}
