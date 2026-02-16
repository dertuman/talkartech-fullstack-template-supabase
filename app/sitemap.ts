import { MetadataRoute } from 'next';
import { locales } from '@/middleware';

import { API_BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';
// or
export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Public routes that should be indexed
  const routes = ['', '/login', '/register'];

  // Generate URLs for each locale and route combination
  const urls: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${API_BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  try {
    await dbConnect();

    // Add sitemaps according to this template (replace SomeModel with the model you want to add, import it from the models folder)

    // const someModel = await SomeModel.find({}, 'slug updatedAt createdAt', {
    //   lean: true,
    // });

    // const someModelUrls = someModel.flatMap((someModel) =>
    //   locales.map((locale) => ({
    //     url: `${API_BASE_URL}/${locale}/someModel/${someModel.slug}`,
    //     lastModified: new Date(
    //       someModel.updatedAt || someModel.createdAt || new Date()
    //     ),
    //     changeFrequency: 'weekly' as const,
    //     priority: 0.7,
    //   }))
    // );

    // urls.push(...someModelUrls);
  } catch (error) {
    console.error('Failed to fetch content for sitemap:', error);
  }

  return urls;
}
