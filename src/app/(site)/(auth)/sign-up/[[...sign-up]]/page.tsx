import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('signUp') };
}

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
