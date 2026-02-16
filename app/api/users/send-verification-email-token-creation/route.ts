import { NextResponse } from 'next/server';
import VerificationEmail from '@/emails/verification';
import { User, UserModel } from '@/models/UserModel';
import { Resend } from 'resend';

import { API_BASE_URL, RESEND_API_KEY } from '@/lib/constants';
import dbConnect from '@/lib/db';

const resend = new Resend(RESEND_API_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    const { from, to, subject, locale } = body;

    let user: User | null = await UserModel.findOne({ email: to });
    let hashedToken;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    hashedToken = user.verifyToken;
    const verificationLink = `${API_BASE_URL}/verify-email?token=${hashedToken}`;

    const emailSendingResponse = await resend.emails.send({
      from,
      to,
      subject,
      react: await VerificationEmail({
        emailData: {
          email: to,
          verificationLink,
        },
        locale,
      }),
      text: '',
    });

    return NextResponse.json(emailSendingResponse);
  } catch (error) {
    console.log(JSON.stringify(error));
    return NextResponse.json({ error });
  }
}
