'use client';

import { useRef, useState, useTransition } from 'react';
import imageCompression from 'browser-image-compression';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AVATAR_MIME_TYPES, avatarSchema } from '@/lib/validation/profile';

import { removeAvatar, uploadAvatar } from './actions';

export function AvatarForm({
  url,
  initials,
}: {
  url: string | null;
  initials: string;
}) {
  const t = useTranslations('settings.profile');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const original = event.target.files?.[0];
    event.target.value = '';
    if (!original) return;

    startTransition(async () => {
      // Shrink in the browser first: faster uploads, smaller bucket.
      const file = await imageCompression(original, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      }).catch(() => original);

      const checked = avatarSchema.safeParse(file);
      if (!checked.success) {
        const key = checked.error.issues[0]?.message ?? 'avatarMissing';
        toast.error(tValidation(key as Parameters<typeof tValidation>[0]));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const body = new FormData();
      body.set('avatar', file);
      const result = await uploadAvatar(body);

      setPreview(null);
      URL.revokeObjectURL(objectUrl);
      if (result.ok) toast.success(t('avatarUpdated'));
      else toast.error(tErrors(result.error));
    });
  };

  const onRemove = () =>
    startTransition(async () => {
      const result = await removeAvatar();
      if (result.ok) toast.success(t('avatarRemoved'));
      else toast.error(tErrors(result.error));
    });

  const src = preview ?? url ?? undefined;

  return (
    <div className="flex items-center gap-5">
      <Avatar className="size-20">
        <AvatarImage src={src} alt={t('avatar')} className="object-cover" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending && <Spinner />}
            {t('uploadAvatar')}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={onRemove}
            >
              {t('removeAvatar')}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{t('avatarHint')}</p>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_MIME_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-label={t('uploadAvatar')}
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
