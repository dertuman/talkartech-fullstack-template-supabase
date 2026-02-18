'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useScopedI18n } from '@/locales/client';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

/**
 * Clerk-free version of ParallaxHeader used when the user has skipped setup.
 * Same animated phrases and layout, but the CTA says "Get Started" and
 * links to /setup instead of /sign-in. No useUser() import.
 */
export function ParallaxHeaderPreview() {
  const tCommon = useScopedI18n('common');
  const tHero = useScopedI18n('hero.phrases');

  const phrases = useMemo(
    () => [
      tHero('incredible'),
      tHero('amazing'),
      tHero('awesome'),
      tHero('fantastic'),
      tHero('great'),
      tHero('wonderful'),
      tHero('amazing'),
      tHero('awesome'),
    ],
    [tHero]
  );

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) =>
        prevIndex === phrases.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <header className="relative h-[calc(100dvh-4.1rem)] w-full overflow-hidden">
      <div className="absolute inset-0 mb-10 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-montserrat text-5xl font-black leading-tight tracking-wider md:text-6xl">
          {tCommon('siteName')}
        </h1>

        <div className="flex h-14 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-2xl"
            >
              {phrases[currentPhraseIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <Button
            asChild
            size="lg"
            className="font-montserrat flex w-56 items-center gap-2 text-lg font-black tracking-wider"
          >
            <Link href="/setup">
              {tCommon('getStarted')}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
