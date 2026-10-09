import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { errorMessage, guardSetupApi } from '@/lib/setup/guard';

export async function POST(req: NextRequest) {
  const blocked = guardSetupApi();
  if (blocked) return blocked;

  try {
    const { url, secretKey } = await req.json();

    if (!url || !secretKey) {
      return NextResponse.json(
        { error: 'URL and secret key are required' },
        { status: 400 }
      );
    }

    // Use secret key to bypass RLS and check if the profiles table exists
    const supabase = createClient(url, secretKey);

    const { error } = await supabase.from('profiles').select('id').limit(0);

    if (error) {
      // If the error says the table doesn't exist, that's our signal
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ exists: false });
      }

      // Some other error: could be permission or network
      console.error('Error checking profiles table:', error);
      return NextResponse.json(
        { error: error.message, exists: false },
        { status: 500 }
      );
    }

    // No error means the table exists and is queryable
    return NextResponse.json({ exists: true });
  } catch (error) {
    console.error('Error verifying database:', error);
    return NextResponse.json(
      { error: errorMessage(error, 'Failed to verify database') },
      { status: 500 }
    );
  }
}
