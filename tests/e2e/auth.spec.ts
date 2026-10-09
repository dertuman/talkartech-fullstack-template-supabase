import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { isConfigured } from './helpers';

/**
 * Runs against a configured app with a real Clerk development instance.
 * Create a test user with a password in Clerk, then set
 * E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD.
 */
const email = process.env.E2E_CLERK_USER_EMAIL;
const password = process.env.E2E_CLERK_USER_PASSWORD;

test.describe('signed in', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await isConfigured(request)), 'App is in setup mode');
    test.skip(!email || !password, 'E2E_CLERK_USER_* not set');
  });

  test('redirects anonymous visitors away from settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('can update the bio', async ({ page }) => {
    await page.goto('/');
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: email!,
        password: password!,
      },
    });

    await page.goto('/settings');
    const bio = `Updated by Playwright at ${Date.now()}`;
    await page.getByLabel('Bio').fill(bio);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Bio')).toHaveValue(bio);
  });
});
