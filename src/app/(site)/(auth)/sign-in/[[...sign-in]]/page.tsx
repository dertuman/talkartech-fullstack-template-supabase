import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('signIn') };
}

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
