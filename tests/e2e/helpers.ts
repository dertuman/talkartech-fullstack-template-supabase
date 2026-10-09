import type { APIRequestContext } from '@playwright/test';

type Health = { status: string; configured: boolean; setupWizard: boolean };

/** Reads the app's mode from the health endpoint. */
export async function getHealth(request: APIRequestContext): Promise<Health> {
  const res = await request.get('/api/health');
  return (await res.json()) as Health;
}

export async function isConfigured(request: APIRequestContext) {
  return (await getHealth(request)).configured;
}
