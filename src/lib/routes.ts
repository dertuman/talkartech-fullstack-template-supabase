import type { Route } from 'next';

/**
 * Routes backed by optional catch-all segments (Clerk's components own the
 * sub-paths). Typed routes only accept them with a trailing segment, so the
 * bare paths are declared once here.
 */
export const routes = {
  signIn: '/sign-in' as Route,
  signUp: '/sign-up' as Route,
  account: '/settings/account' as Route,
};
