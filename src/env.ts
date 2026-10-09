import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Typed, validated environment variables. Import `env` instead of reading
 * `process.env` directly.
 *
 * Everything is optional on purpose: the app boots without credentials and
 * sends you to the /setup wizard. Values that are present must be well formed,
 * so a typo fails loudly at startup instead of deep inside a request.
 */
export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().startsWith('sk_').optional(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().startsWith('whsec_').optional(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
