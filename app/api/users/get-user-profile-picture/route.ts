import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const { emails } = await req.json();
    const users = await UserModel.find({
      email: { $in: emails },
    })
      .select('email profilePicture')
      .lean();

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Users not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Users retrieved successfully',
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
