import { clerkSetup } from '@clerk/testing/playwright';

/**
 * Fetches a Clerk testing token when Clerk keys are present, so signed-in
 * tests bypass bot protection. Without keys the app runs in setup mode and
 * only the setup-mode specs run.
 */
export default async function globalSetup() {
  if (
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    await clerkSetup();
  }
}
