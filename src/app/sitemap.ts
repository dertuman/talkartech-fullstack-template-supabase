import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site';

/** Public, indexable routes. Add your marketing and content pages here. */
const ROUTES = ['/', '/sign-in', '/sign-up'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ROUTES.map((route) => ({
    url: new URL(route, base).toString(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.5,
  }));
}
