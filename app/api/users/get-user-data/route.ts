import { NextRequest, NextResponse } from 'next/server';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    // Accept either email or userId
    const { email, userId } = body;

    let retrievedUser: User | null;

    if (userId) {
      retrievedUser = await UserModel.findById(userId);
    } else if (email) {
      retrievedUser = await UserModel.findOne({ email });
    } else {
      return NextResponse.json(
        { error: 'Either email or userId is required' },
        { status: 400 }
      );
    }

    if (!retrievedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User retrieved successfully',
      success: true,
      data: retrievedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
