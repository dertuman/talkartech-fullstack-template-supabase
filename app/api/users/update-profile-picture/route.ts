import { File } from 'buffer';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserModel } from '@/models/UserModel';
import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';

import {
  SPACES_ENDPOINT,
  SPACES_KEY,
  SPACES_NAME,
  SPACES_REGION,
  SPACES_SECRET,
} from '@/lib/constants';
import dbConnect from '@/lib/db';
import { randomUppercaseString } from '@/lib/utils';

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: `https://${SPACES_REGION}.${SPACES_ENDPOINT}`,
  region: SPACES_REGION!,
  credentials: {
    accessKeyId: SPACES_KEY!,
    secretAccessKey: SPACES_SECRET!,
  },
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
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
      await s3Client.send(
        new PutObjectCommand({
          Bucket: SPACES_NAME,
          Key,
          Body: Buffer.from(buffer),
          ContentType: file.type,
          ACL: 'public-read-write',
        })
      );
    }

    const updateResult = await UserModel.findByIdAndUpdate(session.user.id, {
      $set: {
        profilePicture: path
          ? path
          : 'https://placehold.co/600x400/png?text=Hello+World',
      },
    });

    if (
      currentProfilePicture &&
      currentProfilePicture.length > 0 &&
      currentProfilePicture !==
        'https://placehold.co/600x400/png?text=Hello+World'
    ) {
      const oldKey = new URL(currentProfilePicture).pathname.substring(1); // Remove the leading '/'
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: SPACES_NAME,
          Key: oldKey,
        })
      );
    }

    if (!updateResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
