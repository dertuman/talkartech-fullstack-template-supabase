import { NextResponse } from 'next/server';
import PasswordResetEmail from '@/emails/password-reset';
import { User, UserModel } from '@/models/UserModel';
import bcryptjs from 'bcryptjs';
import { Resend } from 'resend';

import { API_BASE_URL, RESEND_API_KEY } from '@/lib/constants';
import dbConnect from '@/lib/db';

const resend = new Resend(RESEND_API_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    const {
      from,
      to,
      subject,
      emailData: { email },
    } = body;

    const retrievedUser: User | null = await UserModel.findOne({ email });
    if (!retrievedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!retrievedUser._id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const hashedToken = await bcryptjs.hash(retrievedUser._id.toString(), 10);

    await UserModel.findByIdAndUpdate(retrievedUser._id, {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: Date.now() + 3600000,
    });

    const data = await resend.emails.send({
      from,
      to,
      subject,
      react: await PasswordResetEmail({
        emailData: {
          email,
          passwordResetLink: `${API_BASE_URL}/password-reset?token=${hashedToken}&email=${email}`,
        },
      }),
      text: '',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log(JSON.stringify(error));
    return NextResponse.json({ error });
  }
}
