import { NextResponse } from 'next/server';
import { TicketStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth(); 
    const user = session?.user;
    const isAdminUser = await isAdmin();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);

        const userId = searchParams.get('userId');
        const status = searchParams.get('status') as TicketStatus;
        const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'subject' || 'createdAt';
        const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';

        const where: any = {};

        if (!isAdminUser) {
            // Regular users can only see their own tickets
            where.userId = user.id;
        } else {
            // Admins can filter by userId
            if (userId) {
                where.userId = userId;
            }
        }

        if (status) {
            where.status = status;
        }

        const orderBy: any = {};
        orderBy[sortBy] = order;

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy,
            include: {
                user: true, 
            },
        });

        return NextResponse.json(tickets);

    } catch (error) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    const user = session?.user;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { subject, message } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                subject,
                message,
            },
            include: {
                user: true, 
            },
        });

        return NextResponse.json(ticket, { status: 201 });

    } catch (error) {
        console.error('Error creating support ticket:', error);
        return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
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
            return NextResponse.json({ error: 'Support Ticket ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { status } = body;

        const data: any = {};
        if (status) data.status = status;

        const ticket = await prisma.supportTicket.update({
            where: {
                id: id,
            },
            data: data,
            include: {
                user: true,
            },
        });

        return NextResponse.json(ticket);

    } catch (error) {
        console.error('Error updating support ticket:', error);
        return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
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
            return NextResponse.json({ error: 'Support Ticket ID is required for deletion' }, { status: 400 });
        }

        await prisma.supportTicket.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: 'Support Ticket deleted successfully' });

    } catch (error) {
        console.error('Error deleting support ticket:', error);
        return NextResponse.json({ error: 'Failed to delete support ticket' }, { status: 500 });
    }
}