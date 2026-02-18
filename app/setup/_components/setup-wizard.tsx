'use client';

import { useMemo, useState } from 'react';
import { useScopedI18n } from '@/locales/client';
import { Check, Eye } from 'lucide-react';

import { ClerkStep } from './clerk-step';
import { SupabaseStep } from './supabase-step';
import { JwtStep } from './jwt-step';
import { DeployStep } from './deploy-step';

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

export function SetupWizard() {
  const t = useScopedI18n('setup');
  const tSteps = useScopedI18n('setup.steps');
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

  const STEPS = useMemo(
    () => [
      { title: tSteps('auth'), description: tSteps('authDescription') },
      { title: tSteps('database'), description: tSteps('databaseDescription') },
      { title: tSteps('connect'), description: tSteps('connectDescription') },
      { title: tSteps('deploy'), description: tSteps('deployDescription') },
    ],
    [tSteps]
  );

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
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {t('label')}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
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
            // Full reload so middleware + layout re-evaluate with the new cookie
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
                <span className={`text-[10px] ${i === currentStep ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{i + 1}</span>
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
