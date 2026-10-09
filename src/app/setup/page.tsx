import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAppConfigured, isSetupApiEnabled } from '@/lib/setup/config';

import { SetupWizard } from './_components/setup-wizard';

export const metadata: Metadata = {
  title: 'Setup',
  description: 'Connect authentication and database to get started.',
  robots: { index: false },
};

/** The migrations are the single source of truth for the schema. */
async function readMigrations(): Promise<string> {
  const dir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const contents = await Promise.all(
    files.map(
      async (f) => `-- ${f}\n${await readFile(path.join(dir, f), 'utf8')}`
    )
  );
  return contents.join('\n');
}

export default async function SetupPage() {
  if (isAppConfigured()) redirect('/');

  if (!isSetupApiEnabled()) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-3 px-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          This deployment is not configured
        </h1>
        <p className="text-muted-foreground">
          The setup wizard only runs locally. Run{' '}
          <code className="text-foreground">npm run dev</code>, complete setup
          at <code className="text-foreground">localhost:3000/setup</code>, or
          add the variables from <code>.env.example</code> to your hosting
          provider and redeploy.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center px-4 py-10">
      <SetupWizard sql={await readMigrations()} />
    </main>
  );
}
