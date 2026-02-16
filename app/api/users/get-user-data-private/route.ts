import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const retrievedUser: User | null = await UserModel.findById(
      session.user.id
    );

    if (!retrievedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only update lastActivityAt
    await UserModel.findByIdAndUpdate(retrievedUser._id, {
      'stats.overall.lastActivityAt': new Date(),
    });

    // Get updated user data
    const updatedUser = await UserModel.findById(retrievedUser._id);

    return NextResponse.json({
      message: 'User retrieved successfully',
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
