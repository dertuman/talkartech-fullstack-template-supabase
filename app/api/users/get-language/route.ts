import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const retrievedUser: User | null = await UserModel.findById(
      session.user?.id
    );

    if (!retrievedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User language retrieved successfully',
      success: true,
      language: retrievedUser.language,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
