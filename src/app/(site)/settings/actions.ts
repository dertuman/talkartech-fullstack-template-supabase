'use server';

import { revalidatePath } from 'next/cache';
import { auth, clerkClient } from '@clerk/nextjs/server';

import {
  invalidInput,
  ok,
  unauthorized,
  unexpected,
  type ActionResult,
} from '@/lib/action-result';
import { createClient } from '@/lib/supabase/server';
import {
  AVATAR_EXTENSIONS,
  avatarSchema,
  profileSchema,
  type ProfileInput,
} from '@/lib/validation/profile';

const AVATARS = 'avatars';

export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { firstName, lastName, bio, dateOfBirth } = parsed.data;

  try {
    // Identity lives in Clerk, app data in Supabase.
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, { firstName, lastName });

    const { error } = await createClient()
      .from('profiles')
      .update({ bio, date_of_birth: dateOfBirth || null })
      .eq('id', userId);
    if (error) return unexpected(error);
  } catch (error) {
    return unexpected(error);
  }

  revalidatePath('/', 'layout');
  return ok();
}

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const parsed = avatarSchema.safeParse(formData.get('avatar'));
  if (!parsed.success) return invalidInput(parsed.error);
  const file = parsed.data;

  const supabase = createClient();
  const extension =
    AVATAR_EXTENSIONS[file.type as keyof typeof AVATAR_EXTENSIONS];
  // RLS only allows writes inside the caller's own folder.
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
  if (uploadError) return unexpected(uploadError);

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS).getPublicUrl(path);

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
  if (error) return unexpected(error);

  await removeAvatarFiles(supabase, userId, path);
  revalidatePath('/', 'layout');
  return ok({ url: publicUrl });
}

export async function removeAvatar(): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);
  if (error) return unexpected(error);

  await removeAvatarFiles(supabase, userId);
  revalidatePath('/', 'layout');
  return ok();
}

/** Deletes the user's stored avatars, except `keep`. Best effort. */
async function removeAvatarFiles(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  keep?: string
) {
  const { data: files, error } = await supabase.storage
    .from(AVATARS)
    .list(userId);
  if (error) {
    console.error('Failed to list old avatars', error);
    return;
  }

  const stale = files
    .map((file) => `${userId}/${file.name}`)
    .filter((path) => path !== keep);
  if (stale.length === 0) return;

  const { error: removeError } = await supabase.storage
    .from(AVATARS)
    .remove(stale);
  if (removeError) console.error('Failed to remove old avatars', removeError);
}
