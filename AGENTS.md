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
- Dev and test servers for this repo run on port 3100 (`npm run dev -- -p 3100`); Playwright already uses it.

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
