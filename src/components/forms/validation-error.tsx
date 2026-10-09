'use client';

import { useTranslations } from 'next-intl';

import { FieldError } from '@/components/ui/field';

type ValidationKey = Parameters<
  ReturnType<typeof useTranslations<'validation'>>
>[0];

/**
 * Renders a Zod error whose message is a key in the `validation` namespace,
 * falling back to the raw message for anything else.
 */
export function ValidationError({ message }: { message?: string }) {
  const t = useTranslations('validation');
  if (!message) return null;

  const key = message as ValidationKey;
  return <FieldError>{t.has(key) ? t(key) : message}</FieldError>;
}
