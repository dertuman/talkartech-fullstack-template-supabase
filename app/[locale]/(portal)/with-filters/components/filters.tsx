'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useElement } from '@/context/ElementContext';
import { useElementsURLParams } from '@/context/ElementsURLParamsContext';
import { useScopedI18n } from '@/locales/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { X } from 'lucide-react';
import { Control, useForm } from 'react-hook-form';
import { z } from 'zod';

import { getActiveFiltersCount } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { ElementDetails } from './element-details';

const filtersFormSchema = z.object({
  query: z.string().optional(),
});

type FiltersFormType = z.infer<typeof filtersFormSchema>;

const FiltersForm = ({ control }: { control: Control<FiltersFormType> }) => {
  const t = useScopedI18n('common');

  return (
    <FormField
      control={control}
      name="query"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>{t('search')}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input placeholder={t('search')} className="pr-10" {...field} />
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-background hover:bg-destructive absolute right-0 top-0 h-full border px-3 py-2"
                  onClick={() => field.onChange('')}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

interface FilterFormLayoutProps {
  form: ReturnType<typeof useForm<FiltersFormType>>;
  onSubmit: () => void;
  activeFiltersCount: number;
  updateUrlParams: any;
}

const FilterFormLayout: React.FC<FilterFormLayoutProps> = ({
  form,
  onSubmit,
  activeFiltersCount,
}) => {
  const t = useScopedI18n('common');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex w-full flex-wrap-reverse items-center justify-around pt-1">
          <h2 className="relative text-lg font-bold">
            {t('filters')}
            {activeFiltersCount > 0 && (
              <span className="bg-orangeCustom absolute -right-4 top-0 inline-flex items-center justify-center rounded-full px-1 py-px text-xs leading-none text-white">
                {activeFiltersCount}
              </span>
            )}
          </h2>
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              className="border-orangeCustom border px-2 text-xs"
              variant="ghost"
              onClick={() => {
                form.reset({
                  query: '',
                });
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>

        <FiltersForm control={form.control} />
      </form>
    </Form>
  );
};

interface FiltersProps {
  isFiltersOpen: boolean;
  closeSheet: () => void;
}

export function Filters({ isFiltersOpen, closeSheet }: FiltersProps) {
  const { urlParams, updateUrlParams } = useElementsURLParams();
  const searchParams = useSearchParams();
  const activeFiltersCount = getActiveFiltersCount(
    new URLSearchParams(searchParams.toString())
  );

  const form = useForm<FiltersFormType>({
    resolver: zodResolver(filtersFormSchema),
    mode: 'onChange',
    defaultValues: {
      query: urlParams.query || '',
    },
  });

  const { reset, watch } = form;
  const { element, isElementOpen, setIsElementOpen } = useElement();

  useEffect(() => {
    reset({
      query: urlParams.query || '',
    });
  }, [reset, urlParams]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      updateUrlParams({
        query: value.query && value.query.length > 0 ? value.query : undefined,
        page: '1', // reset pagination on filter usage
        limit: '10',
      });
      if (name) {
        sendGTMEvent({
          event: 'filter_start',
          name,
          value: value[name as keyof FiltersFormType],
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateUrlParams]);

  const closeElement = () => {
    updateUrlParams({ id: undefined });
    setIsElementOpen(false);
  };

  return (
    <>
      <Sheet open={isFiltersOpen} onOpenChange={closeSheet}>
        <SheetTrigger asChild className="md:hidden" />
        <SheetContent side="left" className="p-0">
          <div className="max-h-dvh overflow-auto pb-16 md:top-[calc(4rem+1px)]">
            <div className="p-4">
              <FilterFormLayout
                form={form}
                onSubmit={() => {}}
                activeFiltersCount={activeFiltersCount}
                updateUrlParams={updateUrlParams}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="custom-scrollbar hidden pb-12 md:sticky md:top-[calc(4rem+1px)] md:col-span-4 md:block md:max-h-[88vh] md:overflow-auto lg:col-span-3 2xl:col-span-2">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <FilterFormLayout
              form={form}
              onSubmit={() => {}}
              activeFiltersCount={activeFiltersCount}
              updateUrlParams={updateUrlParams}
            />
          </div>
        </div>
      </div>
      {element && (
        <ElementDetails
          element={element}
          isOpen={isElementOpen}
          setOpen={setIsElementOpen}
          onClose={closeElement}
        />
      )}
    </>
  );
}
