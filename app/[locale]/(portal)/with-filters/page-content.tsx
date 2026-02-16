'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ElementProvider } from '@/context/ElementContext';
import { ElementsURLParamsProvider } from '@/context/ElementsURLParamsContext';
import { useScopedI18n } from '@/locales/client';
import { useSession } from 'next-auth/react';

import { buttonVariants } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Icons } from '@/components/icons';

import { ActiveFiltersBadge } from './components/active-filters-badge';
import { ElementsList } from './components/elements-list';
import { Filters } from './components/filters';
import { Sorter } from './components/sorter';

export default function Elements() {
  const t = useScopedI18n('common');
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();
  const session = useSession();

  if (session?.status !== 'authenticated' && session.status !== 'loading') {
    router.push('/login');
  }

  return (
    <Suspense fallback={<Loader />}>
      <ElementProvider>
        <ElementsURLParamsProvider>
          <div className="bg-background w-full">
            <div className="grid grid-cols-12">
              <Filters
                isFiltersOpen={isFiltersOpen}
                closeSheet={() => setFiltersOpen(false)}
              />
              <div className="lg:border-1 col-span-12 md:col-span-8 lg:col-span-9 2xl:col-span-10">
                <div className="h-full px-3 pb-6 pt-4 md:py-6 lg:px-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex md:hidden">
                      <div
                        className={`${buttonVariants({
                          size: 'icon',
                          variant: 'ghost',
                        })} relative mr-2 grid cursor-pointer content-center duration-200 ease-in-out active:scale-125`}
                        onClick={() => setFiltersOpen(true)}
                      >
                        <Suspense
                          fallback={
                            <Icons.filters className="size-8 fill-current" />
                          }
                        >
                          <ActiveFiltersBadge />
                        </Suspense>
                        <span className="sr-only">Filters button</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {t('header')}
                      </h2>
                    </div>
                    <Sorter />
                  </div>

                  <Suspense fallback={<Loader />}>
                    <ElementsList />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </ElementsURLParamsProvider>
      </ElementProvider>
    </Suspense>
  );
}
