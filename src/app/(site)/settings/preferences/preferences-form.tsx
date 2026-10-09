'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { LocaleSwitcher } from '@/components/locale-switcher';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { setThemePreference } from '@/lib/actions/preferences';
import { THEMES, type Theme } from '@/lib/validation/profile';

/** Changes apply immediately; there is nothing to save. */
export function PreferencesForm({ theme }: { theme: Theme }) {
  const t = useTranslations('settings.preferences');
  const tTheme = useTranslations('theme');
  const tErrors = useTranslations('errors');
  const { theme: activeTheme, setTheme } = useTheme();

  const onThemeChange = async (value: string) => {
    setTheme(value);
    const result = await setThemePreference(value);
    if (result.ok) toast.success(t('saved'));
    else toast.error(tErrors(result.error));
  };

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>{t('theme')}</FieldLegend>
        <RadioGroup
          value={activeTheme ?? theme}
          onValueChange={onThemeChange}
          className="flex flex-wrap gap-6"
        >
          {THEMES.map((value) => (
            <Field key={value} orientation="horizontal" className="w-auto">
              <RadioGroupItem value={value} id={`theme-${value}`} />
              <FieldLabel htmlFor={`theme-${value}`} className="font-normal">
                {tTheme(value)}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>

      <Field className="sm:max-w-60">
        <FieldLabel>{t('language')}</FieldLabel>
        <LocaleSwitcher />
      </Field>
    </FieldGroup>
  );
}
