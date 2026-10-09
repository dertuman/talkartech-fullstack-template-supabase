import { NextResponse, type NextRequest } from 'next/server';

import { guardSetupApi } from '@/lib/setup/guard';

/** Calls the Supabase Auth health endpoint, which rejects unknown API keys. */
async function checkKey(baseUrl: string, apiKey: string) {
  const res = await fetch(new URL('/auth/v1/health', baseUrl), {
    headers: { apikey: apiKey },
    cache: 'no-store',
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  const blocked = guardSetupApi();
  if (blocked) return blocked;

  const { url, publishableKey, secretKey } = (await req.json()) as {
    url?: string;
    publishableKey?: string;
    secretKey?: string;
  };

  if (!url || !publishableKey || !secretKey) {
    return NextResponse.json(
      { error: 'URL, publishable key, and secret key are all required' },
      { status: 400 }
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Invalid Supabase URL format' },
      { status: 400 }
    );
  }

  try {
    if (!(await checkKey(baseUrl.origin, publishableKey))) {
      return NextResponse.json(
        {
          error:
            'The publishable key was rejected. Check that you copied it fully.',
        },
        { status: 400 }
      );
    }
    if (!(await checkKey(baseUrl.origin, secretKey))) {
      return NextResponse.json(
        {
          error: 'The secret key was rejected. Check that you copied it fully.',
        },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Could not connect to Supabase. Check your Project URL.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
