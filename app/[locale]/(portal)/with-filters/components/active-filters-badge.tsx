import React from 'react';
import { useSearchParams } from 'next/navigation';

import { getActiveFiltersCount } from '@/lib/utils';
import { Icons } from '@/components/icons';

/**
 * Must be used inside Suspense boundary
 */
export function ActiveFiltersBadge() {
  const searchParams = useSearchParams();
  const activeFiltersCount = getActiveFiltersCount(
    new URLSearchParams(searchParams.toString())
  );

  return (
    <>
      <Icons.filters className="size-8 fill-current" />
      {activeFiltersCount > 0 && (
        <span className="bg-orangeCustom absolute -right-1 top-0 inline-flex items-center justify-center rounded-full px-1 py-px text-xs leading-none text-white">
          {activeFiltersCount}
        </span>
      )}
    </>
  );
}
