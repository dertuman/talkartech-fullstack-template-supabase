import { NextRequest, NextResponse } from 'next/server';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { token } = body;

    const user: User | null = await UserModel.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Clear the forgotPasswordToken and forgotPasswordTokenExpiry
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await UserModel.updateOne({ _id: user._id }, user);

    return NextResponse.json({
      message: 'Password reset token verified successfully',
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
