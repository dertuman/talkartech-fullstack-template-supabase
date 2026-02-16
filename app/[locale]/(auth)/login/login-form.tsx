'use client';

import { Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { signIn, signOut } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useButtonAnimation } from '@/lib/useButtonAnimation';
import { getLoginTranslation, getRandomAnimalEmoji } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/use-toast';

import GoogleButton from '../GoogleButton';

type User = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams()!;
  const t = useScopedI18n('login');
  const tCommon = useScopedI18n('common');
  const [, startTransition] = useTransition();

  const justVerified = searchParams.get('justVerified') === 'true';
  if (justVerified) {
    signOut({
      callbackUrl: '/login?verified=true',
    });
  }
  const verified = searchParams.get('verified') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();

  const { triggerAnimation } = useButtonAnimation('login-mold', 'login-button');

  const loginMutation = useMutation({
    mutationFn: async (user: User) => {
      const { email, password } = user;
      const trimmedEmail = email.trim();
      const res = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
      });
      if (res?.error) {
        console.log({ error: res.error });
        throw new Error(res.error);
      }
      const userLanguageResponse = await axios.get('/api/users/get-language');
      return userLanguageResponse.data.language;
    },
    onMutate: (user) => {
      triggerAnimation();
      sendGTMEvent({
        event: 'login_start',
        value: user,
      });
    },
    onSuccess: (userLocale) => {
      sendGTMEvent({
        event: 'login_success',
        value: userLocale,
      });

      if (userLocale) {
        console.log('locale', userLocale);
        Cookies.set('NEXT_LOCALE', userLocale);
        startTransition(() => {
          window.location.href = '/';
          toast({
            title: `${getLoginTranslation(userLocale)} ${getRandomAnimalEmoji()}`,
          });
        });
      } else {
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
      console.log('Login failed', error.message);
      toast({
        title: tCommon('errorTitle'),
        description: error.message,
      });
      sendGTMEvent({
        event: 'login_error',
        value: JSON.stringify(error),
      });
    },
  });

  const onLogin: SubmitHandler<User> = (user) => {
    loginMutation.mutate(user);
  };

  return (
    <form onSubmit={handleSubmit(onLogin)} className="max-w-64">
      {verified && (
        <div className="mb-3 text-center text-sm text-green-500">
          {t('emailVerified')}
        </div>
      )}
      <div className="mb-5">
        <Label htmlFor="email" className="mb-2 block">
          {tCommon('email')}
        </Label>
        <Input
          type="text"
          id="email"
          {...register('email', {
            required: t('emailRequired'),
            pattern: {
              value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
              message: t('emailInvalid'),
            },
          })}
          placeholder={t('enterEmail')}
        />
        {errors.email?.message && (
          <span className="text-xs text-red-400">{errors.email.message}</span>
        )}
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="password" className="block">
            {tCommon('password')}
          </Label>
          <a
            href="/password-reset"
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            {tCommon('forgotPassword')}
          </a>
        </div>
        <PasswordInput
          id="password"
          register={register('password', {
            required: t('passwordRequired'),
            minLength: {
              value: 8,
              message: t('passwordMinLength'),
            },
          })}
          placeholder={t('enterPassword')}
        />
        {errors.password?.message && (
          <span className="text-xs text-red-400">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="mb-5">
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="relative w-full"
          id="login-mold"
        >
          {loginMutation.isPending ? <Loader /> : tCommon('login')}
          <span
            id="login-button"
            className="absolute left-0 top-0 rounded-md border font-bold transition-transform duration-500 ease-out"
          ></span>
        </Button>
      </div>
      <Suspense fallback={<Loader />}>
        <GoogleButton />
      </Suspense>
    </form>
  );
};

export default LoginForm;
