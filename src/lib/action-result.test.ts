import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { invalidInput, ok, unexpected } from './action-result';

describe('action results', () => {
  it('wraps data on success', () => {
    expect(ok({ id: 1 })).toEqual({ ok: true, data: { id: 1 } });
  });

  it('groups Zod issues by field path', () => {
    const schema = z.object({ name: z.string().min(1, 'required') });
    const parsed = schema.safeParse({ name: '' });
    if (parsed.success) throw new Error('expected failure');

    expect(invalidInput(parsed.error)).toEqual({
      ok: false,
      error: 'invalidInput',
      fieldErrors: { name: ['required'] },
    });
  });

  it('logs unexpected errors without leaking them to the client', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(unexpected(new Error('db password is hunter2'))).toEqual({
      ok: false,
      error: 'unexpected',
    });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
