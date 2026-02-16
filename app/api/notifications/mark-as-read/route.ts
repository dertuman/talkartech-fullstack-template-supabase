import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { NotificationModel } from '@/models/NotificationModel';

import dbConnect from '@/lib/db';

export async function PATCH(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!updatedNotification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Notification marked as read',
      data: updatedNotification,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
