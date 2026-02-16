import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { NotificationModel } from '@/models/NotificationModel';

import dbConnect from '@/lib/db';

// eslint-disable-next-line no-unused-vars
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const notifications = await NotificationModel.updateMany(
      { userId: session.user?.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      message: 'All notifications marked as read',
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
