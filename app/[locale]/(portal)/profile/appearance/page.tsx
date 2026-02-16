import { getScopedI18n } from '@/locales/server';
import { setStaticParamsLocale } from 'next-international/server';

import { Separator } from '@/components/ui/separator';

import { AppearanceForm } from './appearance-form';

export default async function SettingsAppearancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const t = await getScopedI18n('profile');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('account.appearance')}</h3>
        <p className="text-muted-foreground text-sm">
          {t('account.customize')}
        </p>
      </div>
      <Separator />
      <AppearanceForm />
    </div>
  );
}
