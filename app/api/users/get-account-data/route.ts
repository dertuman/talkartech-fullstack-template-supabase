import { NextRequest, NextResponse } from 'next/server';
import { AccountModel } from '@/models/AccountModel';
import { Types } from 'mongoose';

import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    const { userId } = body;

    const retrievedAccount = await AccountModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!retrievedAccount) {
      // in the case of password reset, a 404 is expected
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Account retrieved successfully',
      success: true,
      data: retrievedAccount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
