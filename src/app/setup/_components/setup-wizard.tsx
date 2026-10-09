'use client';

import { useState } from 'react';
import { Check, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ClerkStep } from './clerk-step';
import { DeployStep } from './deploy-step';
import { JwtStep } from './jwt-step';
import { SupabaseStep } from './supabase-step';

export interface SetupData {
  clerkPublishableKey: string;
  clerkSecretKey: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKey: string;
  clerkVerified: boolean;
  supabaseVerified: boolean;
  databaseVerified: boolean;
}

/** Env vars the wizard writes locally and to Vercel. Names match src/env.ts. */
export function buildEnvVars(data: SetupData): Record<string, string> {
  return {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: data.clerkPublishableKey,
    CLERK_SECRET_KEY: data.clerkSecretKey,
    NEXT_PUBLIC_SUPABASE_URL: data.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: data.supabasePublishableKey,
    SUPABASE_SECRET_KEY: data.supabaseSecretKey,
  };
}

export function SetupWizard({ sql }: { sql: string }) {
  const t = useTranslations('setup');
  const [isSkipping, setIsSkipping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SetupData>({
    clerkPublishableKey: '',
    clerkSecretKey: '',
    supabaseUrl: '',
    supabasePublishableKey: '',
    supabaseSecretKey: '',
    clerkVerified: false,
    supabaseVerified: false,
    databaseVerified: false,
  });

  const STEPS = [
    { title: t('steps.auth'), description: t('steps.authDescription') },
    { title: t('steps.database'), description: t('steps.databaseDescription') },
    { title: t('steps.connect'), description: t('steps.connectDescription') },
    { title: t('steps.deploy'), description: t('steps.deployDescription') },
  ];

  const updateData = (updates: Partial<SetupData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('configureYourSite')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('setupDescription')}
        </p>
        <button
          disabled={isSkipping}
          onClick={async () => {
            setIsSkipping(true);
            await fetch('/api/setup/skip', { method: 'POST' });
            // Full reload so the proxy and layout re-evaluate with the new cookie.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = '/';
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
        >
          <Eye className="size-3.5" />
          {isSkipping ? t('redirecting') : t('skipForNow')}
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-center">
            <button
              onClick={() => {
                if (i < currentStep) setCurrentStep(i);
              }}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i < currentStep
                    ? 'cursor-pointer bg-muted text-primary hover:bg-accent'
                    : 'cursor-default bg-muted text-muted-foreground'
              }`}
            >
              {i < currentStep ? (
                <Check className="size-3" />
              ) : (
                <span
                  className={`text-[10px] ${i === currentStep ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                >
                  {i + 1}
                </span>
              )}
              {step.title}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-6 ${
                  i < currentStep ? 'bg-border' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-background p-6">
        {currentStep === 0 && (
          <ClerkStep data={data} updateData={updateData} onNext={nextStep} />
        )}
        {currentStep === 1 && (
          <SupabaseStep
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 2 && (
          <JwtStep
            data={data}
            sql={sql}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && <DeployStep data={data} onBack={prevStep} />}
      </div>
    </div>
  );
}
