import { NextResponse } from 'next/server';
import { PolicyType } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') as PolicyType;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    const policies = await prisma.policy.findMany({
      where,
    });

    return NextResponse.json(policies);

  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 });
    }

    const policy = await prisma.policy.create({
      data: {
        type,
        content,
      },
    });

    return NextResponse.json(policy, { status: 201 });

  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required for update' }, { status: 400 });
    }

    const body = await request.json();
    const { type, content } = body;

    const data: any = {};
    if (type) data.type = type;
    if (content) data.content = content;

    const policy = await prisma.policy.update({
      where: {
        id: id,
      },
      data: data,
    });

    return NextResponse.json(policy);

  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required for deletion' }, { status: 400 });
    }

    await prisma.policy.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Policy deleted successfully' });

  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json({ error: 'Failed to delete policy' }, { status: 500 });
  }
}