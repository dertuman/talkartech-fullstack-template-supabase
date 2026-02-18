import React from 'react';

import { isAppConfigured } from '@/lib/setup/config';

/**
 * Configured home — dynamically imports ParallaxHeader which uses
 * useUser() from @clerk/nextjs. Only loaded when Clerk is available.
 */
async function ConfiguredHome() {
  const { ParallaxHeader } = await import(
    './home-components/parallax-header'
  );
  return <ParallaxHeader />;
}

/**
 * Preview home — dynamically imports the Clerk-free version.
 * Shown when the user has skipped setup.
 */
async function PreviewHome() {
  const { ParallaxHeaderPreview } = await import(
    './home-components/parallax-header-preview'
  );
  return <ParallaxHeaderPreview />;
}

export default function HomePage() {
  const configured = isAppConfigured();

  return (
    <main className="relative w-full">
      {configured ? <ConfiguredHome /> : <PreviewHome />}
    </main>
  );
}
