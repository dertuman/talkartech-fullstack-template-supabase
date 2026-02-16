import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserModel } from '@/models/UserModel';

import dbConnect from '@/lib/db';

export async function GET(req: any) {
  await dbConnect();
  const session = await auth();
  if (!session) {
    // return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  let searchParams;
  try {
    searchParams = req.nextUrl.searchParams;
  } catch (error) {
    console.error('Error accessing search parameters:', error);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const name = searchParams.get('query') || '';
  const sort = searchParams.get('sort');
  const direction = searchParams.get('direction');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  let query: any = {
    // Filter out soft-deleted users from all searches
    isDeleted: { $ne: true },
  };

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  let sortOption: any = { createdAt: direction === 'asc' ? 1 : -1 };
  if (sort === 'name') {
    sortOption = { name: direction === 'asc' ? 1 : -1 };
  }

  try {
    const users = await UserModel.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    // Make sure we're counting only non-deleted users
    const totalUsers = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      message: 'Fetched users successfully',
      data: users,
      totalPages,
    });
  } catch (reason) {
    console.error('Database query failed:', reason);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
