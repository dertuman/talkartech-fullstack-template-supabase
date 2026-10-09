'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import type { Theme } from '@/lib/validation/profile';

/**
 * Applies the theme saved on the signed-in user's profile once per page load,
 * so it follows them across devices.
 */
export function ThemeSync({ theme }: { theme: Theme }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return null;
}
