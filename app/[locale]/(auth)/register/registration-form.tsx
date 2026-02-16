'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useScopedI18n } from '@/locales/client';
import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/use-toast';

type User = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

const RegistrationForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useScopedI18n('register');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<User>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (user: User) => {
      // eslint-disable-next-line no-unused-vars
      const { password, confirmPassword, ...safeUserData } = user;
      sendGTMEvent({
        event: 'registration_start',
        value: safeUserData,
      });

      return axios.post('/api/auth/register', {
        ...safeUserData,
        password,
        locale,
      });
    },
    onSuccess: () => {
      router.push('/login?success=Account has been created');
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });
      sendGTMEvent({
        event: 'registration_success',
        value: getValues(['name', 'email']),
      });
    },
    onError: (error: Error) => {
      console.error('Registration failed', error.message);
      toast({
        title: t('errorRegistering'),
        description: t('errorDescription'),
      });
      sendGTMEvent({
        event: 'registration_error',
        value: getValues(['name', 'email']),
      });
    },
  });

  const onRegister: SubmitHandler<User> = (user) => {
    registerMutation.mutate(user);
  };

  return (
    <form onSubmit={handleSubmit(onRegister)}>
      <div className="mb-5">
        <Label htmlFor="name" className="mb-2 block">
          {t('name')}
        </Label>
        <Input
          type="text"
          id="name"
          {...register('name', {
            required: t('nameRequired'),
            pattern: {
              value: /^[a-zA-Z0-9_ ]+$/,
              message: t('nameInvalid'),
            },
          })}
          placeholder={t('enterName')}
        />
        {errors.name?.message && (
          <span className="text-xs text-red-400">{errors.name.message}</span>
        )}
      </div>

      <div className="mb-5">
        <Label htmlFor="email" className="mb-2 block">
          {t('email')}
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
        <Label htmlFor="password" className="mb-2 block">
          {t('password')}
        </Label>
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
        <Label htmlFor="confirmPassword" className="mb-2 block">
          {t('confirmPassword')}
        </Label>
        <PasswordInput
          id="confirmPassword"
          register={register('confirmPassword', {
            required: t('passwordRequired'),
            validate: (value) => {
              const { password } = getValues();
              return password === value || t('passwordMismatch');
            },
          })}
          placeholder={t('enterConfirmPassword')}
        />
        {errors.confirmPassword?.message && (
          <span className="text-xs text-red-400">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="mb-5">
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full"
        >
          {registerMutation.isPending ? <Loader /> : t('register')}
        </Button>
      </div>
    </form>
  );
};

export default RegistrationForm;
