'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { localeNames, locales } from '@/i18n/config';
import { setLocale } from '@/lib/actions/preferences';

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('locale');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      disabled={pending}
      onValueChange={(next) =>
        startTransition(async () => {
          const result = await setLocale(next);
          if (!result.ok) toast.error(tErrors(result.error));
          router.refresh();
        })
      }
    >
      <SelectTrigger size="sm" aria-label={t('label')} className={className}>
        <Languages />
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {locales.map((value) => (
          <SelectItem key={value} value={value} lang={value}>
            {localeNames[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
