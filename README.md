## Project

Awesome template project for building a fullstack Progressive Web App (PWA) with Next.js, Tailwind CSS, Shadcn UI, TypeScript, and MongoDB.

## Development

Dear user, please read the entire README before commencing. I hope working with this repo is a pleasant experience. If you have any questions, please feel free to reach out to me,
Alex TK

## Google Maps

Your google maps link

## Google Analytics

Your google analytics link

## Google Tag Manager

Your google tag manager link

## Emails

For email development, we are using react-email. To create or develop an email, go to root > emails, and edit or create an email in tsx format. To preview it, use the command `npm run emails`, and a new development server will run on port 3001 (assuming you're using port 3000 for your next.js development server). This way you can edit your email and view the changes in real time. The emails will generally accept props for their data, but the preview server doesn't take props, so we use the default parameter values for the preview server.

## Development Conventions

- **Folder names** example-folder
- **File names** example-file
- **Component names** example-component
- **Variable names** exampleVariable
- **Function names** exampleFunction
- **Class names** ExampleClass
- **Types** ExampleType
- **Constants** EXAMPLE_CONSTANT
- **Environment Variables** EXAMPLE_ENV_VARIABLE

## Types and Models

Most TypeScript types should live inside each respective Model file, in the models folder. Only if no model exists, use the `types` folder.
For example, when defining types and models use this convention:

```ts
export interface User

export const UserModel
```

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Running the development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Testing

We use playwright for automated testing.

Useful commands:

Watch tests

```bash
npx playwright test post-one-user --watch
```

Run one test in headed mode

```bash
npx playwright test post-one-user --headed
```

Run codegen to record your actions to a test

```bash
npx playwright codegen http://localhost:3000/
```

## DB Migration Scripts

We can create scripts to migrate users, under the scripts folder. This can be useful if we want to add new properties to our data models, or if we want to reset data. For example, to reset all users, we can run the following command:

```bash
npm run reset-users
```

## Deploying to Production

The setup wizard handles local development automatically, but going live requires a few extra steps. Follow these in order.

### 1. Create Production Instances

- **Clerk**: In your Clerk dashboard, switch to the **Production** instance (or create one). This gives you live API keys (`pk_live_...`, `sk_live_...`).
- **Supabase**: Use your existing Supabase project (the same one works for both dev and prod).

### 2. Set Up DNS for Clerk (Required)

Clerk in production needs DNS records on your domain. Go to **Clerk Dashboard > Production > Domains** and add these CNAME records in your DNS provider:

| Record | Host | Target |
|--------|------|--------|
| CNAME | `clerk` | `frontend-api.clerk.services` |
| CNAME | `accounts` | `accounts.clerk.services` |
| CNAME | `clkmail` | _(value shown in Clerk dashboard)_ |
| CNAME | `clk._domainkey` | _(value shown in Clerk dashboard)_ |
| CNAME | `clk2._domainkey` | _(value shown in Clerk dashboard)_ |

Wait until all records show **Verified** in the Clerk dashboard and both **SSL certificates** (Frontend API and Account portal) are issued. This can take a few minutes to an hour.

### 3. Set Up the Clerk Webhook

This is what syncs new users to your Supabase `profiles` table.

1. Go to **Clerk Dashboard > Production > Webhooks**
2. Click **Add Endpoint**
3. Set the URL to: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to events: `user.created`, `user.deleted`
5. Copy the **Signing Secret** (`whsec_...`) — you'll need it for the next step

### 4. Configure Vercel Environment Variables

In **Vercel > your project > Settings > Environment Variables**, add all of the following:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Clerk Production > API Keys) |
| `CLERK_SECRET_KEY` | `sk_live_...` (from Clerk Production > API Keys) |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (from step 3) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yourproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase anon/publishable key |
| `SUPABASE_SECRET_DEFAULT_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_NODE_ENV` | `production` |

**Important**: `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at build time. After adding or changing them, you must **redeploy with a clean build** (uncheck "Use existing Build Cache" in Vercel).

### 5. Google OAuth (If Using Google Sign-In)

If you configured Google as a social login provider in Clerk:

1. Go to **Clerk Dashboard > Production > SSO Connections > Google** and note the redirect URI
2. In **Google Cloud Console > Credentials > your OAuth client**, add:
   - `https://yourdomain.com` to **Authorized JavaScript origins**
   - Clerk's redirect URI to **Authorized redirect URIs**

### 6. Deploy

1. Push your code to GitHub
2. In Vercel, trigger a new deployment
3. **Uncheck** "Use existing Build Cache" to ensure env vars are embedded
4. Once deployed, verify:
   - The login button appears in the header
   - Sign-up/sign-in works
   - New users appear in both Clerk dashboard and Supabase `profiles` table

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| No login button in header | `NEXT_PUBLIC_` vars not in build | Redeploy without cache |
| Clerk JS fails to load (CORS/404 errors) | SSL certificates not ready on `clerk.yourdomain.com` | Wait for SSL issuance in Clerk Domains page |
| User signs up but no Supabase profile | Webhook not configured or `CLERK_WEBHOOK_SECRET` missing | Set up webhook in Clerk + add secret to Vercel |
| Google sign-in error | Domain not in Google OAuth origins | Add your domain to Google Cloud Console |

## Learn More

To learn more, contact Alex T. Karslake
