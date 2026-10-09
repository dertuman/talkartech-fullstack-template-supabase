import { expect, test } from '@playwright/test';

test('health endpoint responds', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
  expect(await res.json()).toMatchObject({ status: 'ok' });
});

test('serves robots.txt and a sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
});

test('sends security headers', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.headers()['x-frame-options']).toBe('DENY');
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
  expect(res.headers()['x-powered-by']).toBeUndefined();
});
