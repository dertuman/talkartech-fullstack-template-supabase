'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { buildEnvVars, type SetupData } from './setup-wizard';

interface DeployStepProps {
  data: SetupData;
  onBack: () => void;
}

type StepStatus = 'idle' | 'running' | 'done' | 'error';
type RepoCheck = 'idle' | 'checking' | 'available' | 'taken' | 'error';
type RepoMode = 'new' | 'existing';

export function DeployStep({ data, onBack }: DeployStepProps) {
  const [repoMode, setRepoMode] = useState<RepoMode>('new');

  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('my-site');
  const [vercelToken, setVercelToken] = useState('');

  // Existing repo mode
  const [existingRepo, setExistingRepo] = useState(''); // "owner/repo" format

  const [githubStatus, setGithubStatus] = useState<StepStatus>('idle');
  const [vercelStatus, setVercelStatus] = useState<StepStatus>('idle');

  const [repoUrl, setRepoUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [error, setError] = useState('');

  // GitHub login for the pasted token. Only trusted while that token is current.
  const [ownerLookup, setOwnerLookup] = useState<{
    token: string;
    login: string;
  } | null>(null);
  const tokenReady = githubToken.length >= 10;
  const githubOwner =
    tokenReady && ownerLookup?.token === githubToken ? ownerLookup.login : '';

  // Repo name availability, keyed by owner/name so stale answers are ignored.
  const [repoCheckResult, setRepoCheckResult] = useState<{
    key: string;
    status: RepoCheck;
  } | null>(null);
  const repoKey =
    repoMode === 'new' && githubOwner && repoName.length >= 2
      ? `${githubOwner}/${repoName}`
      : '';
  const repoCheck: RepoCheck = !repoKey
    ? 'idle'
    : repoCheckResult?.key === repoKey
      ? repoCheckResult.status
      : 'checking';

  // GitHub push progress
  const [ghProgress, setGhProgress] = useState(0); // 0-100
  const [ghProgressLabel, setGhProgressLabel] = useState('');
  const [ghFileInfo, setGhFileInfo] = useState(''); // e.g. "42 / 141"

  // Fetch the GitHub username when a token is pasted.
  useEffect(() => {
    if (!tokenReady) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        });
        if (!res.ok) return;
        const user = (await res.json()) as { login: string };
        if (!cancelled)
          setOwnerLookup({ token: githubToken, login: user.login });
      } catch {
        // Ignore: the user sees no owner and can fix the token.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [githubToken, tokenReady]);

  // Debounced repo name availability check (new repo mode only).
  useEffect(() => {
    if (!repoKey) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      let status: RepoCheck = 'error';
      try {
        const res = await fetch(`https://api.github.com/repos/${repoKey}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        });
        status = res.status === 404 ? 'available' : res.ok ? 'taken' : 'error';
      } catch {
        status = 'error';
      }
      if (!cancelled) setRepoCheckResult({ key: repoKey, status });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [repoKey, githubToken]);

  const canDeployNew =
    githubToken.length > 10 &&
    repoName.length > 1 &&
    vercelToken.length > 10 &&
    (repoCheck !== 'taken' || githubStatus === 'done');

  const canDeployExisting =
    existingRepo.includes('/') &&
    existingRepo.split('/').every((part) => part.length > 0) &&
    vercelToken.length > 10;

  const canDeploy = repoMode === 'new' ? canDeployNew : canDeployExisting;

  const isRunning = githubStatus === 'running' || vercelStatus === 'running';
  const allDone =
    (repoMode === 'new' ? githubStatus === 'done' : true) &&
    vercelStatus === 'done';

  /**
   * Push to GitHub via SSE stream: shows real-time progress
   */
  const pushToGitHub = (): Promise<{
    success: boolean;
    repoUrl?: string;
    owner?: string;
    repoName?: string;
    error?: string;
  }> => {
    return new Promise((resolve) => {
      setGhProgress(0);
      setGhProgressLabel('Creating repository...');
      setGhFileInfo('');

      fetch('/api/setup/push-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken, repoName, isPrivate: true }),
      })
        .then((res) => {
          const reader = res.body?.getReader();
          if (!reader) {
            resolve({ success: false, error: 'No response stream' });
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          const read = (): void => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  // Stream ended without a done/error event: something went wrong
                  resolve({
                    success: false,
                    error: 'Connection lost. Please try again.',
                  });
                  return;
                }

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events from the buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue;
                  try {
                    const event = JSON.parse(line.slice(6));
                    handleGitHubEvent(event, resolve);
                  } catch {
                    // Skip malformed events
                  }
                }

                read(); // Continue reading
              })
              .catch(() => {
                resolve({
                  success: false,
                  error: 'Connection lost. Please try again.',
                });
              });
          };

          read();
        })
        .catch(() => {
          resolve({
            success: false,
            error: 'Failed to connect. Please try again.',
          });
        });
    });
  };

  const handleGitHubEvent = (
    event: Record<string, unknown>,
    resolve: (_result: {
      success: boolean;
      repoUrl?: string;
      owner?: string;
      repoName?: string;
      error?: string;
    }) => void
  ) => {
    switch (event.step) {
      case 'creating_repo':
        setGhProgress(5);
        setGhProgressLabel('Creating repository...');
        break;

      case 'waiting_for_repo':
        setGhProgress(10);
        setGhProgressLabel('Initializing repository...');
        break;

      case 'reading_files':
        setGhProgress(15);
        setGhProgressLabel('Reading files...');
        setGhFileInfo(`0 / ${event.total}`);
        break;

      case 'uploading': {
        const current = event.current as number;
        const total = event.total as number;
        // Uploading goes from 15% to 90%
        const uploadProgress = 15 + (current / total) * 75;
        setGhProgress(Math.round(uploadProgress));
        setGhProgressLabel('Uploading files...');
        setGhFileInfo(`${current} / ${total}`);
        break;
      }

      case 'finalizing':
        setGhProgress(95);
        setGhProgressLabel('Finalizing...');
        setGhFileInfo('');
        break;

      case 'done':
        setGhProgress(100);
        setGhProgressLabel('Done!');
        setGhFileInfo('');
        resolve({
          success: true,
          repoUrl: event.repoUrl as string,
          owner: event.owner as string,
          repoName: event.repoName as string,
        });
        break;

      case 'error':
        resolve({ success: false, error: event.error as string });
        break;
    }
  };

  const [savingLocal, setSavingLocal] = useState(false);

  const finishLocally = async () => {
    setError('');
    setSavingLocal(true);
    const res = await fetch('/api/setup/save-env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ envVars: buildEnvVars(data) }),
    });
    if (!res.ok) {
      setSavingLocal(false);
      setError(
        'Could not write .env.local. Check the terminal running the dev server.'
      );
      return;
    }
    // Next.js reloads env files on change; give it a moment, then go home.
    setTimeout(() => {
      // Full reload so the server picks up the new .env.local.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
    }, 1500);
  };

  const handleDeploy = async () => {
    setError('');

    // --- Save env vars to .env.local so the local dev server works ---
    try {
      await fetch('/api/setup/save-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envVars: buildEnvVars(data),
        }),
      });
    } catch {
      // Non-blocking: Vercel deploy can still proceed
    }

    let ownerForVercel = githubOwner;
    let repoForVercel = repoName;

    if (repoMode === 'new') {
      // --- Step 1: Push to GitHub (skip if already done) ---
      if (githubStatus !== 'done') {
        setGithubStatus('running');

        const result = await pushToGitHub();

        if (!result.success) {
          setError(result.error || 'Failed to push to GitHub.');
          setGithubStatus('error');
          return;
        }

        setRepoUrl(result.repoUrl || '');
        ownerForVercel = result.owner || '';
        repoForVercel = result.repoName || repoName;
        setGithubStatus('done');
      }
    } else {
      // Existing repo mode: parse owner/repo
      const [owner = '', repo = ''] = existingRepo.trim().split('/');
      ownerForVercel = owner;
      repoForVercel = repo;
      setRepoUrl(`https://github.com/${existingRepo.trim()}`);
    }

    // --- Step 2: Import on Vercel + set env vars + deploy ---
    setVercelStatus('running');
    try {
      const importRes = await fetch('https://api.vercel.com/v10/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoForVercel,
          framework: 'nextjs',
          gitRepository: {
            type: 'github',
            repo: `${ownerForVercel}/${repoForVercel}`,
          },
        }),
      });

      const importData = await importRes.json();

      if (!importRes.ok) {
        setError(
          importData.error?.message ||
            'Failed to import repo on Vercel. Make sure your Vercel account is connected to GitHub.'
        );
        setVercelStatus('error');
        return;
      }

      const projectId = importData.id;

      const envVars = buildEnvVars(data);

      for (const [key, value] of Object.entries(envVars)) {
        await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value,
            type: 'encrypted',
            target: ['production', 'preview', 'development'],
          }),
        });
      }

      const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoForVercel,
          project: projectId,
          target: 'production',
          gitSource: {
            type: 'github',
            repoId: importData.link?.repoId,
            ref: 'main',
          },
        }),
      });

      if (deployRes.ok) {
        const deployData = await deployRes.json();
        setDeployUrl(
          `https://${deployData.url || deployData.alias?.[0] || `${repoForVercel}.vercel.app`}`
        );
      } else {
        setDeployUrl(`https://${repoForVercel}.vercel.app`);
      }

      setVercelStatus('done');
    } catch {
      setError('Failed to deploy to Vercel. Try again.');
      setVercelStatus('error');
    }
  };

  // ─── Success screen ───
  if (allDone) {
    return (
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/50 bg-primary/10">
          <Check className="size-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground">
            You&rsquo;re live!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your code is on GitHub and Vercel is building your site. It&rsquo;ll
            be ready in about 60 seconds.
          </p>
        </div>
        <div className="pt-2">
          {/* Plain anchor on purpose: a full reload picks up the new env. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Go to your site
            <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="flex items-center justify-center gap-4 pt-1">
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              GitHub
              <ExternalLink className="size-3" />
            </a>
          )}
          {deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Deployment
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ─── Main form ───
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Deploy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your GitHub repository and deploy to Vercel, or finish locally
          and deploy later.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Only working locally for now? Save your keys to{' '}
          <code className="text-foreground">.env.local</code> and start
          building.
        </p>
        <button
          type="button"
          onClick={finishLocally}
          disabled={savingLocal}
          className="shrink-0 rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40"
        >
          {savingLocal ? 'Saving' : 'Finish locally'}
        </button>
      </div>

      {/* Summary */}
      <div className="rounded border border-border bg-muted p-4">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Ready
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {[
            { label: 'Clerk', ok: data.clerkVerified },
            { label: 'Supabase', ok: data.supabaseVerified },
            { label: 'Database', ok: data.databaseVerified },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              {ok && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <Check className="size-3" /> Done
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ───── Repo mode toggle ───── */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">1. GitHub</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRepoMode('new');
              setError('');
            }}
            disabled={isRunning}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              repoMode === 'new'
                ? 'bg-foreground text-background'
                : 'cursor-pointer bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Create new repo
          </button>
          <button
            onClick={() => {
              setRepoMode('existing');
              setError('');
            }}
            disabled={isRunning}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              repoMode === 'existing'
                ? 'bg-foreground text-background'
                : 'cursor-pointer bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            I already have a repo
          </button>
        </div>
      </div>

      {/* ───── New repo mode ───── */}
      {repoMode === 'new' && (
        <>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              We&rsquo;ll create a private repository and push your code to it.
            </p>
            <div className="rounded border border-border bg-muted p-4">
              <ol className="list-inside list-decimal space-y-2.5 text-sm text-muted-foreground">
                <li>
                  Create a free account at{' '}
                  <a
                    href="https://github.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:text-muted-foreground"
                  >
                    github.com/signup
                    <ExternalLink className="size-3" />
                  </a>{' '}
                  (skip if you already have one)
                </li>
                <li>
                  Go to{' '}
                  <a
                    href="https://github.com/settings/tokens?type=beta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:text-muted-foreground"
                  >
                    Fine-grained tokens
                    <ExternalLink className="size-3" />
                  </a>{' '}
                  (this link takes you directly there)
                </li>
                <li>
                  Click the green{' '}
                  <span className="font-medium text-highlight">
                    Generate new token
                  </span>{' '}
                  button
                </li>
                <li>
                  In the{' '}
                  <span className="font-medium text-highlight">Token name</span>{' '}
                  field, type anything (e.g.{' '}
                  <span className="text-foreground">&ldquo;My site&rdquo;</span>
                  )
                </li>
                <li>
                  Leave{' '}
                  <span className="font-medium text-highlight">Expiration</span>{' '}
                  as-is (30 days is fine)
                </li>
                <li>
                  Scroll down to{' '}
                  <span className="font-medium text-highlight">
                    Repository access
                  </span>{' '}
                  (it defaults to{' '}
                  <span className="text-muted-foreground">
                    Public repositories
                  </span>
                  ).{' '}
                  <span className="font-medium text-highlight">
                    Change it to &ldquo;All repositories&rdquo;
                  </span>
                </li>
                <li>
                  Scroll down to{' '}
                  <span className="font-medium text-highlight">
                    Permissions
                  </span>
                  . You need to add two permissions. Make sure you add{' '}
                  <span className="font-medium text-highlight">both</span>:
                  <ul className="mt-2 ml-5 list-none space-y-2 text-muted-foreground">
                    <li className="rounded border border-border bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">①</span> Click{' '}
                      <span className="font-medium text-highlight">
                        + Add permissions
                      </span>
                      , find{' '}
                      <span className="font-medium text-highlight">
                        Administration
                      </span>
                      , set it to{' '}
                      <span className="font-medium text-highlight">
                        Read and write
                      </span>
                    </li>
                    <li className="rounded border border-border bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">②</span> Click{' '}
                      <span className="font-medium text-highlight">
                        + Add permissions
                      </span>{' '}
                      again, find{' '}
                      <span className="font-medium text-highlight">
                        Contents
                      </span>
                      , set it to{' '}
                      <span className="font-medium text-highlight">
                        Read and write
                      </span>
                    </li>
                  </ul>
                  <p className="mt-1.5 ml-5 text-xs text-warning">
                    You should see both Administration and Contents listed under
                    Repositories before continuing.
                  </p>
                </li>
                <li>
                  Scroll to the bottom and click the green{' '}
                  <span className="font-medium text-highlight">
                    Generate token
                  </span>{' '}
                  button
                </li>
                <li>
                  Copy the token (starts with{' '}
                  <span className="font-mono text-foreground">github_pat_</span>
                  ) and paste it below
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="gh-token"
                className="text-sm font-medium text-foreground"
              >
                GitHub Token
              </label>
              <input
                id="gh-token"
                type="password"
                placeholder="github_pat_..."
                value={githubToken}
                onChange={(e) => {
                  setGithubToken(e.target.value.trim());
                  setError('');
                }}
                disabled={isRunning}
                className="w-full rounded border border-border bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="repo-name"
                className="text-sm font-medium text-foreground"
              >
                Repository Name
              </label>
              <input
                id="repo-name"
                type="text"
                placeholder="my-site"
                value={repoName}
                onChange={(e) => {
                  setRepoName(
                    e.target.value
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '-')
                  );
                  setError('');
                }}
                disabled={isRunning}
                className={`w-full rounded border bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${
                  repoCheck === 'taken'
                    ? 'border-destructive focus:border-destructive'
                    : repoCheck === 'available'
                      ? 'border-primary focus:border-primary'
                      : 'border-border focus:border-ring'
                }`}
              />
              <div className="flex items-center gap-1.5">
                {repoCheck === 'checking' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Checking
                    availability...
                  </span>
                )}
                {repoCheck === 'available' && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Check className="size-3" /> Name is available
                  </span>
                )}
                {repoCheck === 'taken' && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" /> Name already taken.
                    Choose a different name
                  </span>
                )}
                {repoCheck === 'idle' && githubToken.length < 10 && (
                  <span className="text-xs text-muted-foreground">
                    Paste your GitHub token first to check name availability
                  </span>
                )}
                {repoCheck === 'idle' && githubToken.length >= 10 && (
                  <span className="text-xs text-muted-foreground">
                    A new private repository will be created on your GitHub
                    account.
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ───── Existing repo mode ───── */}
      {repoMode === 'existing' && (
        <>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Already pushed your code to GitHub? Just tell us the repository
              and we&rsquo;ll deploy it to Vercel.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="existing-repo"
              className="text-sm font-medium text-foreground"
            >
              Repository
            </label>
            <input
              id="existing-repo"
              type="text"
              placeholder="username/my-repo"
              value={existingRepo}
              onChange={(e) => {
                setExistingRepo(e.target.value.trim());
                setError('');
              }}
              disabled={isRunning}
              className="w-full rounded border border-border bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Enter as{' '}
              <span className="font-mono text-foreground">owner/repo</span>{' '}
              (e.g.{' '}
              <span className="font-mono text-foreground">johndoe/my-site</span>
              )
            </p>
          </div>
        </>
      )}

      {/* ───── Vercel section ───── */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">2. Vercel</h3>
        <p className="text-xs text-muted-foreground">
          Vercel hosts your site and makes it available at a public URL.
        </p>
        <div className="rounded border border-border bg-muted p-4">
          <ol className="list-inside list-decimal space-y-2.5 text-sm text-muted-foreground">
            <li>
              Create a free account at{' '}
              <a
                href="https://vercel.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                vercel.com/signup
                <ExternalLink className="size-3" />
              </a>{' '}
              (skip if you already have one):{' '}
              <span className="font-medium text-highlight">
                sign up with GitHub
              </span>{' '}
              so your accounts are linked
            </li>
            <li>
              Go to{' '}
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                Settings &rarr; Tokens
                <ExternalLink className="size-3" />
              </a>{' '}
              (this link takes you directly there)
            </li>
            <li>
              Under{' '}
              <span className="font-medium text-highlight">TOKEN NAME</span>,
              type anything (e.g.{' '}
              <span className="text-foreground">&ldquo;My site&rdquo;</span>)
            </li>
            <li>
              Leave <span className="font-medium text-highlight">SCOPE</span> as
              your personal account (the default)
            </li>
            <li>
              Set <span className="font-medium text-highlight">EXPIRATION</span>{' '}
              to{' '}
              <span className="font-medium text-highlight">No Expiration</span>
            </li>
            <li>
              Click{' '}
              <span className="font-medium text-highlight">Create Token</span>{' '}
              &rarr; copy the token and paste it below
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="v-token"
            className="text-sm font-medium text-foreground"
          >
            Vercel Token
          </label>
          <input
            id="v-token"
            type="password"
            placeholder="Your Vercel API token"
            value={vercelToken}
            onChange={(e) => {
              setVercelToken(e.target.value.trim());
              setError('');
            }}
            disabled={isRunning}
            className="w-full rounded border border-border bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* ───── Progress ───── */}
      {(githubStatus !== 'idle' || vercelStatus !== 'idle') && (
        <div className="space-y-3 rounded border border-border bg-muted p-4">
          {/* GitHub progress (new repo mode only) */}
          {repoMode === 'new' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Push to GitHub</span>
                <StepIndicator status={githubStatus} />
              </div>

              {githubStatus === 'running' && (
                <div className="space-y-1.5">
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
                      style={{ width: `${ghProgress}%` }}
                    />
                  </div>
                  {/* Label + counter */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {ghProgressLabel}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ghFileInfo && ghFileInfo}
                      {!ghFileInfo && ghProgress > 0 && `${ghProgress}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vercel progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deploy to Vercel</span>
            <StepIndicator status={vercelStatus} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          onClick={onBack}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>

        <button
          onClick={handleDeploy}
          disabled={!canDeploy || isRunning}
          className="cursor-pointer rounded bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Deploying
            </span>
          ) : githubStatus === 'error' || vercelStatus === 'error' ? (
            'Retry'
          ) : (
            'Deploy'
          )}
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ status }: { status: StepStatus }) {
  switch (status) {
    case 'running':
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Working
        </span>
      );
    case 'done':
      return (
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <Check className="size-3" /> Done
        </span>
      );
    case 'error':
      return <span className="text-xs text-destructive">Failed</span>;
    default:
      return <span className="text-xs text-muted-foreground">Pending</span>;
  }
}
