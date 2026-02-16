import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { NotificationModel } from '@/models/NotificationModel';

import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const notificationsCount = await NotificationModel.countDocuments({
      userId: session.user?.id,
      read: false,
    });

    return NextResponse.json({ count: notificationsCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications count' },
      { status: 500 }
    );
  }
}
