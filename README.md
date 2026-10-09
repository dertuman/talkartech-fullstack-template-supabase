# Talkartech Full-Stack Template (Supabase)

A production-ready starter for web apps: **Next.js 16**, **React 19**, **Clerk** for authentication, **Supabase** for Postgres and storage, **Tailwind CSS 4** with **shadcn/ui**, and **next-intl** for translations. It boots without any credentials and walks you through setup in the browser.

## What you get

- **Auth with Clerk**: sign-in, sign-up, social logins, and a full account page (email, password, MFA, sessions) under `/settings/account`. Clerk's UI follows the app language.
- **Supabase with real security**: versioned SQL migrations, generated TypeScript types, row level security, and column-level grants so users can never change their own `role`. Clerk tokens are trusted by Supabase through the native third-party auth integration, so every query runs as the signed-in user.
- **Profiles and avatars**: a `profiles` row is created on first visit (the Clerk webhook is a backstop and handles deletion), and avatars upload to a Supabase Storage bucket where each user can only write to their own folder.
- **Server Actions with shared validation**: Zod schemas are used by the browser forms and re-checked on the server. Errors come back as translation keys.
- **Internationalisation**: English and Spanish out of the box, locale from a cookie or the browser, no URL prefixes. A test fails if a translation file is missing a key.
- **Admin example**: `/admin` lists all users, and only works because a database policy allows admins to read every profile.
- **Privacy-friendly analytics**: Google Analytics only loads after the visitor accepts the cookie banner, and the banner only appears if analytics are configured.
- **Quality gates**: strict TypeScript, validated environment variables, ESLint, Prettier, Vitest, Playwright, pgTAP database tests, and GitHub Actions running all of them.
- **SEO and platform basics**: metadata, Open Graph image, sitemap, robots, web manifest, security headers, health check endpoint.

## Quick start

Requirements: Node 22.12 or newer (see `.nvmrc`). Docker is only needed for the local Supabase stack.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. With no credentials the app redirects to `/setup`, a wizard that:

1. Checks your Clerk keys.
2. Checks your Supabase keys.
3. Shows you how to connect Clerk to Supabase and create the tables.
4. Writes `.env.local` for you, and optionally pushes the project to a new GitHub repo and deploys it on Vercel.

Prefer doing it by hand? Copy `.env.example` to `.env.local`, fill it in, and apply the migrations (see below). You can also click "Skip for now" to preview the site without any services.

The setup API only runs in development and only while the app is unconfigured. In production it returns 404.

## Connecting Clerk and Supabase

1. In Clerk, open [Supabase integration](https://dashboard.clerk.com/setup/supabase), activate it, and copy your Clerk domain.
2. In Supabase, go to Authentication, Sign In / Providers, Third-Party Auth, add **Clerk** and paste the domain.
3. Apply the database schema, either:
   - with the CLI: `npx supabase link` then `npm run db:push`, or
   - by pasting `supabase/migrations/*.sql` into the Supabase SQL editor.
4. In Clerk, add a webhook to `https://your-domain/api/webhooks/clerk` for `user.created` and `user.deleted`, and set `CLERK_WEBHOOK_SIGNING_SECRET`.

To make yourself an admin, run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = 'user_...';
```

## Scripts

| Command                         | What it does                                              |
| ------------------------------- | --------------------------------------------------------- |
| `npm run dev`                   | Start the dev server                                      |
| `npm run build` / `npm start`   | Production build and server                               |
| `npm run check`                 | Lint, typecheck and unit tests                            |
| `npm run lint` / `lint:fix`     | ESLint                                                    |
| `npm run format`                | Prettier, including import and Tailwind class sorting     |
| `npm run typecheck`             | Generate route types, then `tsc`                          |
| `npm test`                      | Vitest unit tests                                         |
| `npm run test:e2e`              | Playwright, against a server on port 3100                 |
| `npm run db:start` / `db:stop`  | Local Supabase stack (Docker)                             |
| `npm run db:reset`              | Recreate the local database from migrations and seed      |
| `npm run db:diff -- <name>`     | Generate a migration from changes made in local Studio    |
| `npm run db:push`               | Apply migrations to the linked Supabase project           |
| `npm run db:types`              | Regenerate `src/lib/supabase/database.types.ts`           |
| `npm run test:db`               | Run pgTAP tests in `supabase/tests`                       |

## Working with the database

Migrations in `supabase/migrations` are the single source of truth. Never change the schema only in the dashboard.

```bash
npm run db:start
```

```bash
npm run db:reset
```

After changing the schema, regenerate the types with `npm run db:types` and add a pgTAP test for any new policy in `supabase/tests/database`. `npm run db:start` prints local keys you can put in `.env.local`. To use real Clerk sessions against the local stack, enable `[auth.third_party.clerk]` in `supabase/config.toml`.

Three Supabase clients, each for one job:

| Import                        | Use it in                              | Runs as                     |
| ----------------------------- | -------------------------------------- | --------------------------- |
| `@/lib/supabase/server`       | Server Components, Actions, Routes     | The signed-in user (RLS)    |
| `@/lib/supabase/client`       | Client Components (`useSupabase()`)    | The signed-in user (RLS)    |
| `@/lib/supabase/admin`        | Webhooks, cron, scripts only           | Service role, bypasses RLS  |

## Project structure

```
messages/              Translations (en.json is the reference)
supabase/
  migrations/          SQL migrations, applied in order
  tests/database/      pgTAP tests for RLS and privileges
  seed.sql             Local seed data
src/
  app/
    (site)/            Pages with the header and footer
      (auth)/          Clerk sign-in and sign-up
      settings/        Profile, preferences, account (+ actions.ts)
      admin/           Admin-only example
    api/               Health check, Clerk webhook, setup wizard API
    setup/             Setup wizard
  components/          App components; ui/ holds shadcn/ui primitives
  i18n/                Locale config and request resolution
  lib/
    actions/           Server Actions shared across pages
    supabase/          Clients and generated types
    validation/        Zod schemas shared by client and server
    auth.ts            requireUserId() for protected pages
    profile.ts         getCurrentProfile(), cached per request
  env.ts               Validated environment variables
  proxy.ts             Clerk middleware and setup-mode routing
tests/e2e/             Playwright specs
```

## Conventions

- **Authorization lives with the data.** Every protected page calls `requireUserId()`, every Server Action checks `auth()`, and RLS is the final word. The proxy only routes between setup mode and the app.
- **Read in Server Components, write in Server Actions.** Actions validate with the shared Zod schema and return an `ActionResult` instead of throwing.
- **No hardcoded copy.** Add strings to `messages/en.json` and `messages/es.json`. Validation messages are keys under `validation`.
- **Use `env`, not `process.env`.** Add new variables to `src/env.ts` and `.env.example`.
- **Add UI primitives with the shadcn CLI**: `npx shadcn@latest add <component>`.
- Files and folders are `kebab-case`, components `PascalCase`, constants `SCREAMING_SNAKE_CASE`.

## Adding a language

1. Add the code to `locales` and `localeNames` in `src/i18n/config.ts`.
2. Copy `messages/en.json` to `messages/<code>.json` and translate it. `npm test` tells you if a key is missing.
3. Add the matching Clerk localization in `src/app/layout.tsx`.

## Testing

- `npm test` runs unit tests for validation, locale negotiation, action results and translation completeness.
- `npm run test:e2e` starts the app on port 3100 and runs Playwright on desktop and mobile. Without credentials it tests setup mode. With Clerk keys plus `E2E_CLERK_USER_EMAIL` and `E2E_CLERK_USER_PASSWORD` (a password user in your Clerk development instance), it also tests the signed-in flows.
- `npm run test:db` checks that users can only read and change their own data, cannot promote themselves, and cannot write into other users' storage folders.

## Deploying to Vercel

1. Create a production instance in Clerk, add its DNS records, and wait for them to verify.
2. Set every variable from `.env.example` in Vercel (Settings, Environment Variables). `NEXT_PUBLIC_` values are inlined at build time, so redeploy after changing them.
3. Apply migrations to the production Supabase project (`npm run db:push`).
4. Add the production webhook in Clerk and set `CLERK_WEBHOOK_SIGNING_SECRET`.
5. If you use Google sign-in, add your domain to the OAuth client in Google Cloud Console.

| Symptom                                   | Fix                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Site shows "This deployment is not configured" | Environment variables are missing; add them and redeploy        |
| Clerk fails to load in production         | DNS or SSL for `clerk.your-domain` not ready yet                     |
| Queries return nothing for signed-in users | Clerk is not added as a third-party provider in Supabase            |
| Avatar upload fails                       | Migrations not applied, so the `avatars` bucket does not exist       |

## Before you ship your own product

- Rename `PROJECT` in `src/lib/site.ts`, and replace `public/logo.png`, `src/app/icon.png` and `src/app/apple-icon.png`.
- Delete the setup wizard (`src/app/setup`, `src/app/api/setup`, `src/lib/setup`) once you no longer need it, and simplify `src/proxy.ts`.
- Plug an error tracker into `src/app/error.tsx` and `src/app/global-error.tsx`.
