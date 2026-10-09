import type { z } from 'zod';

/**
 * Uniform return type for Server Actions. Actions return errors instead of
 * throwing so the client can show them; `error` is a key in the `errors`
 * message namespace and `fieldErrors` values are keys in `validation`.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'unauthorized' | 'invalidInput' | 'unexpected';
      fieldErrors?: Record<string, string[] | undefined>;
    };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function invalidInput<T>(error: z.ZodError): ActionResult<T> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { ok: false, error: 'invalidInput', fieldErrors };
}

export function unauthorized<T>(): ActionResult<T> {
  return { ok: false, error: 'unauthorized' };
}

export function unexpected<T>(cause: unknown): ActionResult<T> {
  console.error(cause);
  return { ok: false, error: 'unexpected' };
}
