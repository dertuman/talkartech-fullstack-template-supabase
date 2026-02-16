'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useScopedI18n } from '@/locales/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/use-toast';
import GoogleButton from '@/app/[locale]/(auth)/GoogleButton';

type AuthMode = 'login' | 'register';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onAuthSuccess?: () => Promise<void> | void;
  onAction?: () => void;
  actionButtonText?: string;
  redirectUrl?: string;
  titleText?: string;
  descriptionText?: string;
  pendingComment?: string;
  hideCloseButton?: boolean;
}

export function AuthDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  onAction,
  actionButtonText,
  redirectUrl,
  titleText,
  descriptionText,
  hideCloseButton,
}: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [accordionValue, setAccordionValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const locale = useCurrentLocale();
  const t = useScopedI18n('authDialog');
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  const authForm = useForm<{
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }>();

  const { mutateAsync: registerUser } = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      return axios.post('/api/auth/register', {
        ...data,
        locale,
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      // Try resend-verification-email first, fallback to send-verification-email
      try {
        const response = await axios.post(
          '/api/users/resend-verification-email',
          { email }
        );
        return response.data;
      } catch (error) {
        // Fallback to existing send-verification-email endpoint
        const response = await axios.post(
          '/api/users/send-verification-email',
          { email }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      toast({
        title: t('verificationEmailSent'),
        description: t('verificationEmailSentDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.response?.data?.error || t('verificationEmailError'),
      });
    },
  });

  const handleGoogleLogin = () => {
    signIn('google', {
      callbackUrl: redirectUrl || window.location.href,
      redirect: true,
    });
  };

  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setAccordionValue('credentials');
    authForm.reset(); // Reset form when switching modes
    setUnverifiedEmail(null); // Clear unverified email state
  };

  const handleAuth = async (data: any) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setUnverifiedEmail(null); // Clear any previous unverified email state

      if (authMode === 'register') {
        await registerUser(data);

        // Show success message for registration
        toast({
          title: t('register') + ' Success',
          description: 'Please check your email to verify your account.',
        });

        // Switch to login mode after successful registration
        setAuthMode('login');
        authForm.reset();
        return;
      }

      // For login
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Check if this is a verification issue by calling a separate endpoint
        try {
          const verificationCheck = await axios.post(
            '/api/users/check-verification',
            {
              email: data.email.trim(),
              password: data.password,
            }
          );

          if (
            !verificationCheck.data.verified &&
            verificationCheck.data.credentialsValid
          ) {
            setUnverifiedEmail(data.email.trim());
            return; // Don't throw error for unverified case
          }
        } catch (checkError) {
          // If verification check endpoint doesn't exist, check the error message
          if (
            result.error.includes('verify') ||
            result.error.includes('verification')
          ) {
            setUnverifiedEmail(data.email.trim());
            return; // Assume it's a verification issue
          }
          // Otherwise, it means credentials are wrong
        }

        throw new Error('Invalid email or password');
      }

      // Close dialog on successful login
      onOpenChange(false);

      if (onAuthSuccess) {
        await onAuthSuccess();
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: t('error'),
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      resendVerificationMutation.mutate(unverifiedEmail);
    }
  };

  // Add an effect to handle the success callback after social login
  useEffect(() => {
    const handlePendingSuccess = async () => {
      const isPending = localStorage.getItem('pendingAuthSuccess');

      if (isPending && onAuthSuccess) {
        localStorage.removeItem('pendingAuthSuccess');
        await onAuthSuccess();
        onOpenChange(false); // Close the dialog after successful auth
      }
    };

    if (session?.user) {
      handlePendingSuccess();
    }
  }, [session, onAuthSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="custom-scrollbar max-h-[90vh] min-h-[300px] gap-0 overflow-y-auto bg-card sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose={hideCloseButton}
      >
        <DialogHeader className="mb-4 justify-center">
          <DialogTitle className="text-center text-xl">
            {titleText || t('joinUs')}
          </DialogTitle>
          <DialogDescription className="text-center text-foreground">
            {descriptionText || t('joinUsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center">
          <GoogleButton
            onClick={handleGoogleLogin}
            noAnimation
            className="w-full"
          />

          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value="credentials" className="border-none">
              <AccordionTrigger className="mb-2 rounded-lg bg-muted px-6 py-3 text-sm uppercase">
                {t('orUseCredentials')}
              </AccordionTrigger>
              <AccordionContent>
                <form
                  onSubmit={authForm.handleSubmit(handleAuth)}
                  className="space-y-4"
                >
                  {authMode === 'register' && (
                    <div>
                      <Label htmlFor="name">{t('name')}</Label>
                      <Input
                        id="name"
                        {...authForm.register('name', {
                          required: t('nameRequired'),
                          pattern: {
                            value: /^[a-zA-Z0-9_. ]+$/,
                            message:
                              'Name can only contain letters, numbers, spaces, dots, and underscores',
                          },
                        })}
                        placeholder={t('enterName')}
                      />
                      {authForm.formState.errors.name && (
                        <span className="text-xs text-red-500">
                          {authForm.formState.errors.name.message}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      {...authForm.register('email', {
                        required: t('emailRequired'),
                        pattern: {
                          value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
                          message: t('emailInvalid'),
                        },
                      })}
                      placeholder={t('enterEmail')}
                    />
                    {authForm.formState.errors.email && (
                      <span className="text-xs text-red-500">
                        {authForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">{t('password')}</Label>
                    <PasswordInput
                      id="password"
                      register={authForm.register('password', {
                        required: t('passwordRequired'),
                        minLength: {
                          value: 8,
                          message: t('passwordMinLength'),
                        },
                      })}
                      placeholder={t('enterPassword')}
                    />
                    {authForm.formState.errors.password && (
                      <span className="text-xs text-red-500">
                        {authForm.formState.errors.password.message}
                      </span>
                    )}
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <Label htmlFor="confirmPassword">
                        {t('confirmPassword')}
                      </Label>
                      <PasswordInput
                        id="confirmPassword"
                        register={authForm.register('confirmPassword', {
                          required: t('confirmPasswordRequired'),
                          validate: (value) =>
                            value === authForm.getValues('password') ||
                            t('passwordMismatch'),
                        })}
                        placeholder={t('enterConfirmPassword')}
                      />
                      {authForm.formState.errors.confirmPassword && (
                        <span className="text-xs text-red-500">
                          {authForm.formState.errors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  )}

                  {unverifiedEmail && authMode === 'login' && (
                    <div className="rounded-md border bg-muted/50 p-3 text-center">
                      <div className="mb-2 flex items-center justify-center">
                        <svg
                          className="mr-2 h-4 w-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {t('emailVerificationRequired')}
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">
                        {t('emailVerificationMessage')}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendVerificationMutation.isPending}
                        className="h-8 text-xs"
                      >
                        {resendVerificationMutation.isPending ? (
                          <Loader className="mr-1 size-3" />
                        ) : null}
                        {t('resendEmail')}
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader className="mr-2 size-4" />
                    ) : authMode === 'login' ? (
                      t('login')
                    ) : (
                      t('register')
                    )}
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center text-sm text-muted-foreground">
            {authMode === 'login' ? (
              <p>
                {t('noAccount')}
                <Button
                  variant="link"
                  onClick={() => handleAuthModeChange('register')}
                >
                  {t('createAccount')}
                </Button>
              </p>
            ) : (
              <p>
                {t('haveAccount')}{' '}
                <Button
                  variant="link"
                  onClick={() => handleAuthModeChange('login')}
                >
                  {t('signIn')}
                </Button>
              </p>
            )}
            <p className="mb-2 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>

          {actionButtonText && (
            <Button type="button" variant="outline" onClick={onAction}>
              {actionButtonText}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
