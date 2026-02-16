import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getScopedI18n } from '@/locales/server';
import axios from 'axios';

import { API_BASE_URL } from '@/lib/constants';

import PageContent from './page-content';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const userId = params.id;
  const baseUrl = API_BASE_URL || 'http://localhost:3001';

  if (!userId) {
    return getDefaultMetadata(baseUrl);
  }

  try {
    const { data: user } = await axios.get(`${baseUrl}/users?id=${userId}`);

    if (!user || !user.images) {
      return getDefaultMetadata(baseUrl);
    }

    const imageUrl =
      user.images[0]?.imageUrl ||
      'https://PROJECT.fra1.digitaloceanspaces.com/activities-og.png';

    return {
      metadataBase: new URL(baseUrl),
      title: user.title,
      description: user.description,
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${baseUrl}/users?id=${userId}`,
        title: user.title,
        description: user.description,
        siteName: 'PROJECT®',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: user.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@PROJECT',
        title: user.title,
        description: user.description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: user.title,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Failed to fetch user metadata:', error);
    return getDefaultMetadata(baseUrl);
  }
}

async function getDefaultMetadata(baseUrl: string): Promise<Metadata> {
  const t = await getScopedI18n('login');
  return {
    metadataBase: new URL(baseUrl),
    title: t('metaData.title'),
    description: t('metaData.description'),
    openGraph: {
      type: 'website',
      locale: t('metaData.openGraph.locale'),
      url: baseUrl,
      title: t('metaData.title'),
      description: t('metaData.description'),
      siteName: 'PROJECT®',
      images: [
        {
          url: 'https://placehold.co/400',
          width: 1200,
          height: 630,
          alt: 'PROJECT® - PROJECT description',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@PROJECT',
      title: t('metaData.title'),
      description: t('metaData.description'),
      images: [
        {
          url: 'https://placehold.co/400',
          width: 1200,
          height: 630,
          alt: 'PROJECT® - PROJECT description',
        },
      ],
    },
  };
}

export default async function WithFiltersPage() {
  const session = await auth();
  if (!session) redirect('/login');
  return <PageContent />;
}
