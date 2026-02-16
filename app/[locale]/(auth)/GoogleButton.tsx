'use client';

import { useSearchParams } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

import { useButtonAnimation } from '@/lib/useButtonAnimation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GoogleButtonProps {
  onClick?: () => void;
  noAnimation?: boolean;
  className?: string;
}

const GoogleButton = ({
  onClick,
  noAnimation,
  className,
}: GoogleButtonProps) => {
  const t = useScopedI18n('login');
  const searchParams = useSearchParams()!;
  const callbackUrl = searchParams.get('callbackUrl');

  const { triggerAnimation } = useButtonAnimation(
    'google-mold',
    'google-button'
  );

  const handleLogin = () => {
    if (onClick) {
      onClick();
    } else {
      signIn('google', {
        callbackUrl: callbackUrl ? decodeURIComponent(callbackUrl) : '/',
        redirect: true,
      });
    }
    if (!noAnimation) {
      triggerAnimation();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogin}
      variant="outline"
      className={cn('relative mb-4 w-full', className)}
      id="google-mold"
    >
      <FcGoogle size={20} className="mr-3" />
      <span className="select-none">{t('loginWithGoogle')}</span>
      {!noAnimation && (
        <span
          id="google-button"
          className="absolute left-0 top-0 rounded-md border font-bold transition-transform duration-500 ease-out"
        ></span>
      )}
    </Button>
  );
};

export default GoogleButton;
