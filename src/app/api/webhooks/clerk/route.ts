import { NextResponse, type NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Clerk webhook. Subscribe to `user.created` and `user.deleted` in the Clerk
 * dashboard and set CLERK_WEBHOOK_SIGNING_SECRET.
 *
 * Handlers are idempotent because Svix retries deliveries.
 */
export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'user.created': {
      // The app also creates the row lazily on first visit; this is a backstop.
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { id: event.data.id },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      if (error) return failure('create profile', error);
      break;
    }

    case 'user.deleted': {
      const userId = event.data.id;
      if (!userId) break;

      // Remove personal data: avatar files, then the profile row.
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);
      if (listError) return failure('list avatars', listError);

      if (files.length > 0) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove(files.map((file) => `${userId}/${file.name}`));
        if (removeError) return failure('remove avatars', removeError);
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) return failure('delete profile', error);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function failure(step: string, error: unknown) {
  console.error(`Clerk webhook: failed to ${step}`, error);
  // 500 makes Svix retry the delivery later.
  return NextResponse.json({ error: `Failed to ${step}` }, { status: 500 });
}
