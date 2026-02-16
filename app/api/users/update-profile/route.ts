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
    const formData = await req.formData();
    const updateOperation: any = {};

    // Basic profile fields
    if (formData.get('name')) updateOperation.name = formData.get('name');
    if (formData.get('bio')) updateOperation.bio = formData.get('bio');
    if (formData.get('dob')) updateOperation.dob = formData.get('dob');
    if (formData.get('profilePicture'))
      updateOperation.profilePicture = formData.get('profilePicture');
    if (formData.get('font')) updateOperation.font = formData.get('font');
    if (formData.get('theme')) updateOperation.theme = formData.get('theme');
    if (formData.get('language'))
      updateOperation.language = formData.get('language');

    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      updateOperation,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
