'use client';

import { useEffect, useRef, useState } from 'react';
import { useElementsURLParams } from '@/context/ElementsURLParamsContext';
import { useScopedI18n } from '@/locales/client';
import { motion } from 'framer-motion';
import { Trash } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Icons } from '@/components/icons';

export function Sorter() {
  const tCommon = useScopedI18n('common');
  const { urlParams, updateUrlParams } = useElementsURLParams();
  const [sortOption, setSortOption] = useState<string>('rating');
  const [sortDirection, setSortDirection] = useState<string>('desc');
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    updateUrlParams({ sort, direction: sortDirection });
  };

  const handleDirectionChange = (direction: string) => {
    setSortDirection(direction);
    updateUrlParams({ sort: sortOption, direction });
  };

  const handleClear = () => {
    setSortOption('rating');
    setSortDirection('desc');
    updateUrlParams({ sort: '', direction: '' });
  };

  useEffect(() => {
    if (urlParams.sort) {
      setSortOption(urlParams.sort);
    }
    if (urlParams.direction) {
      setSortDirection(urlParams.direction);
    }
  }, [urlParams.sort, urlParams.direction]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
        event.stopPropagation();
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('click', handleClickOutside, true);
    } else {
      document.removeEventListener('click', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isPopoverOpen]);

  const activeSortersCount = sortDirection !== 'desc' ? 1 : 0;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className={buttonVariants({
            size: 'icon',
            variant: 'ghost',
            className:
              'mr-2 cursor-pointer active:scale-110 duration-200 ease-in-out grid content-center relative',
          })}
        >
          <motion.div
            key={sortDirection}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {sortDirection === 'desc' ? (
              <Icons.sorterDesc className="size-8 fill-current" />
            ) : (
              <Icons.sorterAsc className="size-8 fill-current" />
            )}
            {activeSortersCount > 0 && (
              <span className="bg-orangeCustom absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full px-1 py-px text-xs leading-none text-white">
                {activeSortersCount}
              </span>
            )}
          </motion.div>

          <span className="sr-only">Sorter button</span>
        </div>
      </PopoverTrigger>
      <PopoverContent ref={popoverRef} className="p-4">
        <div className="flex flex-col space-y-2">
          <Button
            variant={sortOption === 'rating' ? 'secondary' : 'ghost'}
            onClick={() => handleSortChange('rating')}
          >
            {tCommon('sortByRating')}{' '}
            {sortOption === 'rating' && <Icons.check className="ml-2" />}
          </Button>
          <div className="flex justify-between space-x-2">
            <Button
              variant={sortDirection === 'asc' ? 'secondary' : 'ghost'}
              onClick={() => handleDirectionChange('asc')}
            >
              {tCommon('ascending')}{' '}
              {sortDirection === 'asc' && <Icons.check className="ml-2" />}
            </Button>
            <Button
              variant={sortDirection === 'desc' ? 'secondary' : 'ghost'}
              onClick={() => handleDirectionChange('desc')}
            >
              {tCommon('descending')}{' '}
              {sortDirection === 'desc' && <Icons.check className="ml-2" />}
            </Button>
          </div>
          <Button variant="destructive" onClick={handleClear}>
            {tCommon('reset')}
            <Trash className="ml-2 size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
