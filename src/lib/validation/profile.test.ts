import { describe, expect, it } from 'vitest';

import { AVATAR_MAX_BYTES, avatarSchema, profileSchema } from './profile';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  bio: 'Wrote the first program.',
  dateOfBirth: '1990-12-10',
};

function firstError(input: unknown) {
  const result = profileSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('profileSchema', () => {
  it('accepts a complete profile and trims whitespace', () => {
    const result = profileSchema.parse({ ...valid, firstName: '  Ada  ' });
    expect(result.firstName).toBe('Ada');
  });

  it('allows an empty date of birth', () => {
    expect(profileSchema.safeParse({ ...valid, dateOfBirth: '' }).success).toBe(
      true
    );
  });

  it('returns translation keys as error messages', () => {
    expect(firstError({ ...valid, firstName: ' ' })).toBe('firstNameRequired');
    expect(firstError({ ...valid, bio: 'x'.repeat(301) })).toBe('bioTooLong');
    expect(firstError({ ...valid, dateOfBirth: '1899-12-31' })).toBe(
      'dateTooEarly'
    );
    expect(firstError({ ...valid, dateOfBirth: '2999-01-01' })).toBe(
      'dateInFuture'
    );
    expect(firstError({ ...valid, dateOfBirth: '10/12/1990' })).toBe(
      'dateInvalid'
    );
  });
});

describe('avatarSchema', () => {
  const image = (size: number, type = 'image/png') =>
    new File([new Uint8Array(size)], 'avatar', { type });

  it('accepts a small image', () => {
    expect(avatarSchema.safeParse(image(1024)).success).toBe(true);
  });

  it('rejects files that are too large, empty or not images', () => {
    const message = (file: unknown) =>
      avatarSchema.safeParse(file).error?.issues[0]?.message;

    expect(message(image(AVATAR_MAX_BYTES + 1))).toBe('avatarTooLarge');
    expect(message(image(0))).toBe('avatarMissing');
    expect(message(image(10, 'image/svg+xml'))).toBe('avatarWrongType');
    expect(message('not a file')).toBe('avatarMissing');
  });
});
