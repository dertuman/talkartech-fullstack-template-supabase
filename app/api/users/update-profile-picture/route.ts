import { File } from 'buffer';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';

import {
  SPACES_ENDPOINT,
  SPACES_KEY,
  SPACES_NAME,
  SPACES_REGION,
  SPACES_SECRET,
} from '@/lib/constants';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { randomUppercaseString } from '@/lib/utils';

function getS3Client() {
  return new S3({
    forcePathStyle: false,
    endpoint: `https://${SPACES_REGION}.${SPACES_ENDPOINT}`,
    region: SPACES_REGION!,
    credentials: {
      accessKeyId: SPACES_KEY!,
      secretAccessKey: SPACES_SECRET!,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('profilePicture');
    const currentProfilePicture = form.get('currentProfilePicture') as string;

    const isFile = file instanceof File;
    const isDelete = typeof file === 'string';

    if (!isFile && !isDelete)
      return NextResponse.json({ message: 'Please provide a file' });

    let path;
    if (isFile) {
      const buffer = await file.arrayBuffer();
      const Key = randomUppercaseString() + '_' + file.name;
      path = 'https://PROJECT.fra1.digitaloceanspaces.com/' + Key;
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: SPACES_NAME,
          Key,
          Body: Buffer.from(buffer),
          ContentType: file.type,
          ACL: 'public-read-write',
        })
      );
    }

    const supabase = await createClerkSupabaseClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        profile_picture: path
          ? path
          : 'https://placehold.co/600x400/png?text=Hello+World',
      })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (
      currentProfilePicture &&
      currentProfilePicture.length > 0 &&
      currentProfilePicture !==
        'https://placehold.co/600x400/png?text=Hello+World'
    ) {
      const oldKey = new URL(currentProfilePicture).pathname.substring(1); // Remove the leading '/'
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: SPACES_NAME,
          Key: oldKey,
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully uploaded file and set key in db',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}
