import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);

        const isActiveStr = searchParams.get('isActive');
        const sortBy = searchParams.get('sortBy') as 'subscribedAt' | 'email' || 'subscribedAt';
        const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';

        const where: { isActive?: boolean } = {};

        if (isActiveStr) {
            where.isActive = isActiveStr === 'true';
        }

        const orderBy: any = {};
        orderBy[sortBy] = order;

        const newsletters = await prisma.newsletter.findMany({
            where,
            orderBy,
        });

        return NextResponse.json(newsletters);

    } catch (error) {
        console.error('Error fetching newsletter subscriptions:', error);
        return NextResponse.json({ error: 'Failed to fetch newsletter subscriptions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const newsletter = await prisma.newsletter.create({
            data: {
                email,
            },
        });

        return NextResponse.json(newsletter, { status: 201 });

    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 });
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
            return NextResponse.json({ error: 'Newsletter ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { email, isActive } = body;

        const data: any = {};
        if (email) data.email = email;
        if (isActive !== undefined) data.isActive = isActive === 'true';

        const newsletter = await prisma.newsletter.update({
            where: {
                id: id,
            },
            data: data,
        });

        return NextResponse.json(newsletter);

    } catch (error) {
        console.error('Error updating newsletter subscription:', error);
        return NextResponse.json({ error: 'Failed to update newsletter subscription' }, { status: 500 });
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
        const email = searchParams.get('email');

        if (!id && !email) {
            return NextResponse.json({ error: 'Newsletter ID or email is required for deletion' }, { status: 400 });
        }

        const whereClause: { id?: string; email?: string } = {};
        if (id) {
            whereClause.id = id;
        } else if (email) {
            whereClause.email = email;
        }

        if (!whereClause.id && !whereClause.email) {
            return NextResponse.json({ error: 'Newsletter ID or email is required for deletion' }, { status: 400 });
        }

        await prisma.newsletter.delete({
            where: whereClause as { id: string } | { email: string },
        });

        return NextResponse.json({ message: 'Newsletter subscription deleted successfully' });

    } catch (error) {
        console.error('Error deleting newsletter subscription:', error);
        return NextResponse.json({ error: 'Failed to delete newsletter subscription' }, { status: 500 });
    }
}