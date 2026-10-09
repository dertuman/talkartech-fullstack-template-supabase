import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse, type NextRequest } from 'next/server';

import { guardSetupApi } from '@/lib/setup/guard';

export async function POST(req: NextRequest) {
  const blocked = guardSetupApi();
  if (blocked) return blocked;

  try {
    const { envVars } = (await req.json()) as {
      envVars: Record<string, string>;
    };

    if (!envVars || typeof envVars !== 'object') {
      return NextResponse.json(
        { error: 'envVars object is required' },
        { status: 400 }
      );
    }

    const envPath = join(process.cwd(), '.env.local');

    // Read existing .env.local if it exists, so we don't clobber unrelated vars
    const existing: Record<string, string> = {};

    if (existsSync(envPath)) {
      const content = await readFile(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        existing[key] = value;
      }
    }

    // Merge: new values overwrite existing ones
    const merged = { ...existing, ...envVars };

    // Write the file
    const lines = Object.entries(merged).map(
      ([key, value]) => `${key}=${value}`
    );
    await writeFile(envPath, lines.join('\n') + '\n', 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving .env.local:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save env file',
      },
      { status: 500 }
    );
  }
}
