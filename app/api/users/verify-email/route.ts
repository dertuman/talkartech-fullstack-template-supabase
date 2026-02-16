import { NextRequest, NextResponse } from 'next/server';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const reqBody = await request.json();
    const { token } = reqBody;

    const user: User | null = await UserModel.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { verifyToken: 1, verifyTokenExpiry: 1 },
      }
    );

    return NextResponse.json({
      message: 'Email verified successfully',
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
