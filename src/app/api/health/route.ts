import { NextResponse } from 'next/server';

import { isAppConfigured, isSetupApiEnabled } from '@/lib/setup/config';

export const dynamic = 'force-dynamic';

/** Liveness probe for uptime monitors and load balancers. */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      configured: isAppConfigured(),
      setupWizard: isSetupApiEnabled(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
