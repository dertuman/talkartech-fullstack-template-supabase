import React from 'react';
import { setStaticParamsLocale } from 'next-international/server';

import { ParallaxHeader } from './home-components/parallax-header';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  return (
    <main className="relative w-full">
      <ParallaxHeader />
    </main>
  );
}
