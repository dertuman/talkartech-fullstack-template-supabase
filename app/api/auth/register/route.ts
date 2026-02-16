import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import axios from 'axios';
import bcryptjs from 'bcryptjs';

import { API_BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();

    const { name, email, password, locale } = body;

    const user = await UserModel.findOne({ email });

    if (user) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password on the server side for security
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the user directly with UserModel.create()
    const savedUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!savedUser._id) {
      throw new Error('Failed to create user: _id is undefined');
    }

    if (!savedUser._id) {
      throw new Error('Failed to create user: _id is undefined');
    }

    const hashedToken = await bcryptjs.hash(savedUser._id.toString(), 10);

    await UserModel.findByIdAndUpdate(savedUser._id, {
      verifyToken: hashedToken,
      verifyTokenExpiry: Date.now() + 3600000,
    });

    const payload = {
      from: 'no-reply@project.com',
      to: email,
      subject: 'Welcome to PROJECT®! Your email verification link',
      emailData: {
        email,
        verificationLink: `${API_BASE_URL}/verify-email?token=${hashedToken}`,
      },
      locale,
    };

    await axios.post(
      `${API_BASE_URL}/api/users/send-verification-email`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      message: 'User created successfully',
      success: true,
      savedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
