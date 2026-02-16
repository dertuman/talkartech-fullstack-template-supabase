import { NextRequest, NextResponse } from 'next/server';
import { User, UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { id } = body;

    const retrievedUser: User | null = await UserModel.findById(id);

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
