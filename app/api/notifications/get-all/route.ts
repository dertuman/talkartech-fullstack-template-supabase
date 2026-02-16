import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Notification, NotificationModel } from '@/models/NotificationModel';

import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const notifications: Notification[] = await NotificationModel.find({
      userId: session.user?.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
