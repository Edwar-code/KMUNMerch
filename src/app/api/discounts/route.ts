import { NextResponse } from 'next/server';
import { DiscountType } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') as DiscountType;
    const validFromStr = searchParams.get('validFrom');
    const validUntilStr = searchParams.get('validUntil');
    const sortBy = searchParams.get('sortBy') as 'value' | 'createdAt' || 'createdAt';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (validFromStr) {
      where.validFrom = {
        gte: new Date(validFromStr),
      };
    }

    if (validUntilStr) {
      where.validUntil = {
        lte: new Date(validUntilStr),
      };
    }

    const orderBy: any = {};
    orderBy[sortBy] = order;

    const discounts = await prisma.discount.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(discounts);

  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, type, value, validFrom, validUntil } = body;

    if (!name || !type || !value || !validFrom || !validUntil) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        name,
        description,
        type,
        value: parseFloat(value), // Parse value to a number
        validFrom: new Date(validFrom), // Convert to a Date object
        validUntil: new Date(validUntil), // Convert to a Date object
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
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
      return NextResponse.json({ error: 'Discount ID is required for update' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, type, value, validFrom, validUntil } = body;

    const data: any = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (type) data.type = type;
    if (value) data.value = parseFloat(value);
    if (validFrom) data.validFrom = new Date(validFrom);
    if (validUntil) data.validUntil = new Date(validUntil);

    const discount = await prisma.discount.update({
      where: {
        id: id,
      },
      data: data,
    });

    return NextResponse.json(discount);

  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
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
      return NextResponse.json({ error: 'Discount ID is required for deletion' }, { status: 400 });
    }

    await prisma.discount.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Discount deleted successfully' });

  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
  }
}