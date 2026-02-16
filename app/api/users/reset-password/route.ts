import { NextRequest, NextResponse } from 'next/server';
import { User, UserModel } from '@/models/UserModel';
import bcryptjs from 'bcryptjs';

import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();

    const { email, password } = body;

    const retrievedUser: User | null = await UserModel.findOne({ email });

    if (!retrievedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    //hash password using bcryptjs.
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await UserModel.updateOne(
      { _id: retrievedUser._id },
      {
        password: hashedPassword,
      }
    );

    await UserModel.updateOne(
      { _id: retrievedUser._id },
      {
        $unset: { forgotPasswordToken: 1, forgotPasswordTokenExpiry: 1 },
      }
    );

    return NextResponse.json({
      message: 'User updated successfully',
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
