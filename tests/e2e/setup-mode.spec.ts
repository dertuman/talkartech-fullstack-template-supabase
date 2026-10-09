import { expect, test } from '@playwright/test';

import { getHealth, isConfigured } from './helpers';

test.describe('setup mode', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(await isConfigured(request), 'App already has credentials');
  });

  test('sends first-time visitors to /setup', async ({ page, request }) => {
    const { setupWizard } = await getHealth(request);
    await page.goto('/');
    await expect(page).toHaveURL(/\/setup$/);

    // The wizard only runs in development; production explains what to do.
    await expect(
      page.getByRole('heading', {
        name: setupWizard
          ? 'Configure your site'
          : 'This deployment is not configured',
      })
    ).toBeVisible();
  });

  test('can skip setup and preview the site', async ({ page, request }) => {
    test.skip(!(await getHealth(request)).setupWizard, 'Wizard is dev-only');
    await page.goto('/setup');
    await page.getByRole('button', { name: /skip for now/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Setup is incomplete.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('blocks pages that need auth while previewing', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: 'setup-skipped', value: '1', url: baseURL! },
    ]);
    await page.goto('/settings');
    await expect(page).toHaveURL('/?setup=required');
  });

  test('switches language without changing the URL', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: 'setup-skipped', value: '1', url: baseURL! },
    ]);
    await page.goto('/');

    const switcher = page.getByRole('combobox', { name: 'Language' });
    if (!(await switcher.isVisible())) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Español' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveURL('/');
  });
});
