import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  try {
    const { locale } = await req.json();

    const updateResult = await UserModel.findByIdAndUpdate(
      session.user.id,
      { $set: { language: locale } },
      { new: true }
    ).lean();

    if (!updateResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Locale updated successfully',
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
