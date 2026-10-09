'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ValidationError } from '@/components/forms/validation-error';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { routes } from '@/lib/routes';
import { profileSchema, type ProfileInput } from '@/lib/validation/profile';

import { updateProfile } from './actions';

export function ProfileForm({
  email,
  defaultValues,
}: {
  email: string;
  defaultValues: ProfileInput;
}) {
  const t = useTranslations('settings.profile');
  const tErrors = useTranslations('errors');
  const [pending, startTransition] = useTransition();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.ok) {
        form.reset(values);
        toast.success(t('saved'));
        return;
      }
      // Surface server-side validation on the matching fields.
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(name as keyof ProfileInput, { message: messages?.[0] });
      }
      toast.error(tErrors(result.error));
    })
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName">{t('firstName')}</FieldLabel>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <ValidationError message={fieldState.error?.message} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lastName">{t('lastName')}</FieldLabel>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <ValidationError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
          <Input id="email" value={email} readOnly disabled />
          <FieldDescription>
            <Link href={routes.account}>{t('emailHint')}</Link>
          </FieldDescription>
        </Field>

        <Controller
          control={form.control}
          name="bio"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bio">{t('bio')}</FieldLabel>
              <Textarea
                id="bio"
                rows={4}
                maxLength={300}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldDescription>{t('bioHint')}</FieldDescription>
              <ValidationError message={fieldState.error?.message} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="sm:max-w-60">
              <FieldLabel htmlFor="dateOfBirth">{t('dateOfBirth')}</FieldLabel>
              <Input
                id="dateOfBirth"
                type="date"
                min="1900-01-01"
                max={new Date().toISOString().slice(0, 10)}
                autoComplete="bday"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <ValidationError message={fieldState.error?.message} />
            </Field>
          )}
        />

        <div>
          <Button type="submit" disabled={pending || !form.formState.isDirty}>
            {pending && <Spinner />}
            {t('save')}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
