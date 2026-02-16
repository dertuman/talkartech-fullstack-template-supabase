import { NextResponse } from 'next/server';
import VerificationEmail from '@/emails/verification';
import { Resend } from 'resend';

import { RESEND_API_KEY } from '@/lib/constants';

const resend = new Resend(RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      from,
      to,
      subject,
      emailData: { email, verificationLink },
      locale,
    } = body;

    const data = await resend.emails.send({
      from,
      to,
      subject,
      react: await VerificationEmail({
        emailData: {
          email,
          verificationLink,
        },
        locale,
      }),
      text: '',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log(JSON.stringify(error));
    return NextResponse.json({ error });
  }
}
