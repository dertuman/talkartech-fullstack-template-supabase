# Agent guide

Instructions for AI coding agents working in this repository. Read README.md for the full picture.

## Versions matter

This project uses Next.js 16, React 19, Clerk Core 3 (`@clerk/nextjs` 7), Zod 4, Tailwind CSS 4 and ESLint 10 flat config. Your training data may predate them.

- Next.js ships its docs in `node_modules/next/dist/docs`. Read the relevant page before using an API you are unsure about. `middleware.ts` is now `proxy.ts`.
- Clerk Core 3 removed `<SignedIn>` and `<SignedOut>`: use `<Show when="signed-in">`. `createRouteMatcher` is deprecated: protect resources with `requireUserId()` from `src/lib/auth.ts` instead.
- Zod 4: use `z.iso.date()`, `z.url()`, and `error.issues`.

## Rules

- Check authorization where data is read or written: `requireUserId()` in protected pages, `auth()` in every Server Action, RLS in the database. Never rely on the proxy.
- Never use the admin Supabase client (`@/lib/supabase/admin`) for anything a user triggers. It bypasses RLS.
- Schema changes go in a new file in `supabase/migrations`. Update `src/lib/supabase/database.types.ts` (`npm run db:types`) and add pgTAP tests for new policies.
- Grant clients only the columns they may write (see the profiles migration). RLS alone does not stop a user from editing a column on their own row.
- User-facing text goes in `messages/en.json` and every other locale file. Validation messages are keys under `validation`.
- Read environment variables through `env` from `@/env`, and declare new ones there and in `.env.example`.
- Add UI primitives with `npx shadcn@latest add`, not by hand. Import `cn` from `cn`.
- Interactive development follows the dev server policy below. Playwright retains its isolated test port.

## Before you finish

```bash
npm run check
```

Also run `npm run test:e2e` when you touch routing, the proxy, layouts or forms, and `npm run test:db` when you touch migrations.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local development servers (user preference, 2026-11-11)

- Start or find this repository's dev server with
  `~/Documents/GitHub/scripts/dev up`, run from this checkout, and review on
  the URL it prints. Never start a server by hand or choose a port yourself.
  This is standing authorization; do not ask again.
- The script reuses a server already serving this checkout, so every agent
  on this project shares one. A new server gets port 3000 when it is free and
  the next free port (3001, 3002) when another project is in use there.
- Never stop another project's dev server yourself. The script stops only
  servers no agent is using. `dev up --main` moves this repository onto 3000
  and stops the dev server there: use it only when the user asks for 3000 or
  a login callback is registered for 3000.
- If the script reports that 3000 is held by something that is not a dev
  server, report that rather than killing it.
- Verify the server responds and check the change there yourself. This does
  not authorize production builds, deployments, commits, pushes, or unrelated
  tests and data changes.
