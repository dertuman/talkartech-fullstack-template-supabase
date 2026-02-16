import { Metadata } from 'next';
import { defaultLocale, locales } from '@/middleware';

import { API_BASE_URL } from './constants';

type GenerateMetadataOptions = {
  path: string;
  currentLocale: string;
  addXDefault?: boolean;
};

type GenerateDefaultMetadataOptions = {
  currentLocale: string;
  path: string;
  translations: {
    title: string;
    description: string;
    ogLocale?: string;
    ogSiteName?: string;
    imageAlt?: string;
    twitterSite?: string;
  };
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  keywords?: string[];
};

export function generateAlternates({
  path,
  currentLocale,
  addXDefault = true,
}: GenerateMetadataOptions): NonNullable<Metadata['alternates']> {
  const baseUrl = API_BASE_URL;
  const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '');
  const canonical = `${baseUrl}/${currentLocale}${normalizedPath}`;

  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${normalizedPath}`;
  });

  if (addXDefault) {
    languages['x-default'] = `${baseUrl}/${defaultLocale}${normalizedPath}`;
  }

  return {
    canonical,
    languages,
  };
}

export function generateDefaultMetadata({
  currentLocale,
  path,
  translations,
  keywords = [],
  image = {
    url: 'https://via.placeholder.com/300x300/6366f1/ffffff?text=Profile',
    width: 1200,
    height: 630,
    alt: 'Profile',
  },
}: GenerateDefaultMetadataOptions): Metadata {
  const baseUrl = API_BASE_URL || 'http://localhost:3000';
  const alternates = generateAlternates({
    path,
    currentLocale,
    addXDefault: true,
  });

  const pageUrl = new URL(`/${currentLocale}${path}`, baseUrl).toString();

  return {
    metadataBase: new URL(baseUrl),
    title: translations.title,
    description: translations.description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    alternates,
    openGraph: {
      type: 'website',
      locale: translations.ogLocale || currentLocale,
      url: pageUrl,
      siteName: translations.ogSiteName || 'PROJECT',
      title: translations.title,
      description: translations.description,
      images: [
        {
          url: image.url,
          width: image.width || 1200,
          height: image.height || 630,
          alt: image.alt || translations.imageAlt || translations.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: translations.twitterSite || '@PROJECT',
      title: translations.title,
      description: translations.description,
      images: [
        {
          url: image.url,
          width: image.width || 1200,
          height: image.height || 630,
          alt: image.alt || translations.imageAlt || translations.title,
        },
      ],
    },
  };
}
