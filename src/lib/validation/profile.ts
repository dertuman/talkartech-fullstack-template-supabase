import { z } from 'zod';

/**
 * Shared between the client forms and the Server Actions, so the browser
 * gives instant feedback and the server never trusts it. Error messages are
 * keys in the `validation` namespace of messages/*.json.
 */

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const MIN_BIRTH_DATE = '1900-01-01';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'firstNameRequired')
    .max(64, 'firstNameTooLong'),
  lastName: z.string().trim().max(64, 'lastNameTooLong'),
  bio: z.string().trim().max(300, 'bioTooLong'),
  // Empty string means "not set". Dates are compared as ISO strings.
  dateOfBirth: z.union([
    z.literal(''),
    z.iso
      .date('dateInvalid')
      .refine((value) => value >= MIN_BIRTH_DATE, 'dateTooEarly')
      .refine((value) => value <= todayIso(), 'dateInFuture'),
  ]),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const avatarSchema = z
  .instanceof(File, { message: 'avatarMissing' })
  .refine((file) => file.size > 0, 'avatarMissing')
  .refine((file) => file.size <= AVATAR_MAX_BYTES, 'avatarTooLarge')
  .refine(
    (file) => (AVATAR_MIME_TYPES as readonly string[]).includes(file.type),
    'avatarWrongType'
  );

export const AVATAR_EXTENSIONS: Record<
  (typeof AVATAR_MIME_TYPES)[number],
  string
> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
