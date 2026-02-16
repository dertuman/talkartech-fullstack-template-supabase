'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  email: string;
  password?: string;
  confirmPassword?: string;
};

interface PasswordResetFormProps {
  verified: boolean;
  email: string;
}

export function PasswordResetForm({ verified, email }: PasswordResetFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<User>();

  useEffect(() => {
    setValue('email', email);
  }, [email, setValue]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: User) => {
      if (!verified) {
        const retrievedUser = await axios.post('/api/users/get-user-data', {
          email: data.email,
        });
        const userId = retrievedUser.data.data._id;

        try {
          await axios.post('/api/users/get-account-data', { userId });
        } catch (error) {
          const payload = {
            to: data.email,
            from: 'no-reply@PROJECT.com',
            subject: 'Password Reset Request 🫡',
            emailData: {
              email: data.email,
            },
          };
          await axios.post('/api/users/send-password-reset-email', payload);
        }
      } else {
        await axios.post('/api/users/reset-password', {
          email: data.email,
          password: data.password,
        });
      }
    },
    onSuccess: () => {
      if (!verified) {
        toast({
          title: 'Email sent 📧',
          description:
            'If an email with this address exists, we will send you a link to reset your password 🦀',
        });
      } else {
        toast({
          title: 'Success 🫡',
          description:
            'Your password has been reset, redirecting you to the login page... 👌',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    },
    onError: (error: any) => {
      console.log('Password reset failed', error.message);
      toast({
        title: 'Error resetting password 😢',
        description: error.response?.data?.error,
      });
    },
  });

  const onSubmit: SubmitHandler<User> = (data) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <Label htmlFor="email" className="mb-2 block">
          Email
        </Label>
        <Input
          type="text"
          id="email"
          {...register('email', {
            required: 'Please enter your email',
            pattern: {
              value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
              message: 'Email is invalid',
            },
          })}
          placeholder="Enter your email"
        />
        {errors.email?.message && (
          <span className="text-xs text-red-400">{errors.email.message}</span>
        )}
      </div>

      {verified && (
        <>
          <div className="mb-5">
            <Label htmlFor="password" className="mb-2 block">
              Password
            </Label>
            <PasswordInput
              id="password"
              register={register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password should be at least 8 characters',
                },
              })}
              placeholder="Enter your password"
            />
            {errors.password?.message && (
              <span className="text-xs text-red-400">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="mb-5">
            <Label htmlFor="confirmPassword" className="mb-2 block">
              Confirm Password
            </Label>
            <PasswordInput
              id="confirmPassword"
              register={register('confirmPassword', {
                required: 'Password confirmation is required',
                validate: (value) => {
                  const { password } = getValues();
                  return password === value || 'Passwords should match!';
                },
              })}
              placeholder="Enter your password"
            />
            {errors.confirmPassword?.message && (
              <span className="text-xs text-red-400">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
        </>
      )}

      <div className="mb-5">
        <Button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full"
        >
          {!resetPasswordMutation.isPending && verified && 'Reset password'}
          {!resetPasswordMutation.isPending && !verified && 'Request a link'}
          {resetPasswordMutation.isPending && <Loader />}
        </Button>
      </div>
    </form>
  );
}
