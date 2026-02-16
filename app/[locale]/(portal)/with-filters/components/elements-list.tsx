/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useElement } from '@/context/ElementContext';
import { useElementsURLParams } from '@/context/ElementsURLParamsContext';
import { useScopedI18n } from '@/locales/client';
import { User } from '@/models/UserModel';
import { sendGTMEvent } from '@next/third-parties/google';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Button } from '@/components/ui/button';

import { ElementCard } from './element-card';

const fetchFilteredElements = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam: number;
  queryKey: string[];
}) => {
  const [, searchParamsString] = queryKey;

  const searchParams = new URLSearchParams(searchParamsString);

  const queryParams = new URLSearchParams({
    query: searchParams.get('query') || '',
    sort: searchParams.get('sort') || '',
    direction: searchParams.get('direction') || '',
    page: pageParam.toString(),
    limit: '10',
  });

  const response = await axios.get(`/api/users/search?${queryParams}`);

  const appliedFilters: Record<string, string> = {};
  queryParams.forEach((value, key) => {
    if (value) {
      appliedFilters[key] = value;
    }
  });

  sendGTMEvent({
    event: 'filter_success',
    value: appliedFilters,
  });

  return {
    data: response.data.data,
    totalPages: response.data.totalPages,
    currentPage: pageParam,
  };
};

const fetchElementById = async (id: string) => {
  const response = await axios.get(`/api/users/get?id=${id}`);
  return response.data.data;
};

export function ElementsList() {
  const t = useScopedI18n('common');
  const { setElement, setIsElementOpen } = useElement();
  const searchParams = useSearchParams();

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateUrlParams } = useElementsURLParams();

  const filterParamsString = searchParams.toString();

  const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
    queryKey: ['elements', filterParamsString],
    queryFn: fetchFilteredElements,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Refetch activities when window gains focus
  useEffect(() => {
    const handleWindowFocus = () => refetch();
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [refetch]);

  const elementQuery = useQuery({
    queryKey: ['element', searchParams.get('id')],
    queryFn: () => fetchElementById(searchParams.get('id') || ''),
    enabled: !!searchParams.get('id'),
  });

  useEffect(() => {
    refetch();
  }, [
    searchParams.get('query'),
    searchParams.get('sort'),
    searchParams.get('direction'),
  ]);

  useEffect(() => {
    if (elementQuery.data) {
      setElement(elementQuery.data);
      setIsElementOpen(true);
    } else if (!searchParams.get('id')) {
      setIsElementOpen(false);
    }
  }, [elementQuery.data, searchParams, setElement, setIsElementOpen]);

  const openElementDetails = (element: User) => {
    updateUrlParams({
      id: element._id || '',
    });

    sendGTMEvent({ event: 'element_open', value: element });

    setElement(element);
    setIsElementOpen(true);
  };

  const elements = data?.pages.flatMap((page) => page.data) || [];
  const hasActiveFilters = searchParams.toString() !== '';

  const clearFilters = () => {
    router.push('/with-filters');
  };

  if (elements.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-lg">{t('noElementsFound')}</p>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outlinePrimary">
            {t('clear')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={elements.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<span>{t('loading')}</span>}
    >
      <div className="grid grid-cols-12" ref={containerRef}>
        {elements.map((element: User) => (
          <div
            key={element._id}
            className="buddy-item col-span-6 cursor-pointer px-1.5 odd:pl-0 even:pr-0 lg:col-span-4 lg:px-3 lg:odd:pl-3 lg:even:pr-3 xl:col-span-3 xl:px-3 xl:first:pl-0 lg:[&:nth-child(3n)]:pr-0 xl:[&:nth-child(3n)]:pr-3 lg:[&:nth-child(3n+1)]:pl-0 xl:[&:nth-child(3n+1)]:pl-3 xl:[&:nth-child(4n)]:pl-3 xl:[&:nth-child(4n)]:pr-0 xl:[&:nth-child(4n+1)]:pl-0"
            onClick={() => openElementDetails(element)}
          >
            <ElementCard element={element} />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
