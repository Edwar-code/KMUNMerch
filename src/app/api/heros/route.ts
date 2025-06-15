import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const isActiveStr = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' || 'createdAt';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';

    const where: any = {};

    if (isActiveStr) {
      where.isActive = isActiveStr === 'true';
    }

    const orderBy: any = {};
    orderBy[sortBy] = order;

    const heros = await prisma.hero.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(heros);

  } catch (error) {
    console.error('Error fetching heros:', error);
    return NextResponse.json({ error: 'Failed to fetch heros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, image, link, isActive } = body;

    console.log("Received isActive:", isActive);

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const hero = await prisma.hero.create({
      data: {
        title,
        subtitle,
        image,
        link,
        isActive: isActive,
      },
    });

    return NextResponse.json(hero, { status: 201 });

  } catch (error) {
    console.error('Error creating hero:', error);
    return NextResponse.json({ error: 'Failed to create hero' }, { status: 500 });
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
            return NextResponse.json({ error: 'Hero ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { title, subtitle, image, link, isActive } = body;

        const data: any = {};  // Use a single data object

        //Conditionally include fields if they exist in the request body.
        if (title !== undefined) {
            data.title = title;
        }
        if (subtitle !== undefined) {
            data.subtitle = subtitle;
        }
        if (image !== undefined) {
            data.image = image;
        }
        if (link !== undefined) {
            data.link = link;
        }

        if (isActive !== undefined) {
            data.isActive = isActive; 
        }


        const hero = await prisma.hero.update({
            where: {
                id: id,
            },
            data: data, // Pass the constructed 'data' object
        });

        return NextResponse.json(hero);

    } catch (error) {
        console.error('Error updating hero:', error);
        return NextResponse.json({ error: 'Failed to update hero' }, { status: 500 });
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
      return NextResponse.json({ error: 'Hero ID is required for deletion' }, { status: 400 });
    }

    await prisma.hero.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Hero deleted successfully' });

  } catch (error) {
    console.error('Error deleting hero:', error);
    return NextResponse.json({ error: 'Failed to delete hero' }, { status: 500 });
  }
}