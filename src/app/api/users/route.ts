import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    const session = await auth();
    const userSession = session?.user;
    const isAdminUser = await isAdmin();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); 
        const role = searchParams.get('role') as UserRole;
        // Fix for the default values - use nullish coalescing operator
        const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'name' | 'email') ?? 'createdAt';
        const order = (searchParams.get('order') as 'asc' | 'desc') ?? 'asc';


        if (id) { // Fetch single user by ID
            if (!isAdminUser && userSession?.id !== id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: id,
                },
            });

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            return NextResponse.json(user);
        }

        // If no ID is provided, fetch a list of users (Admin Only)
        if (!isAdminUser) {
            return NextResponse.json({ error: 'Unauthorized to list all users.' }, { status: 403 });
        }


        const where: any = {};

        if (role) {
            where.role = role;
        }

        const orderBy: any = {};
        orderBy[sortBy] = order;

        const users = await prisma.user.findMany({
            where,
            orderBy,
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, email, password, role, number } = body;

        if (!name || !email || !password || !role || !number) {
            return NextResponse.json({ error: 'Name, email, password, role, and number are required' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                number: parseInt(number, 10).toString()
            },
        });

        return NextResponse.json(user, { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
         if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    const userSession = session?.user;
    const isAdminUser = await isAdmin();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID is required for update' }, { status: 400 });
        }

        const body = await request.json();

        // Allow users to update their own profiles
        if (!isAdminUser && userSession?.id !== id) {
            //  Prevent non-admins from updating role
            if (body.role) {
              return NextResponse.json({ error: 'Unauthorized to update role.' }, {status: 403})
            }
        }

        // Handle password hashing if it exists in the update data
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        // Convert number to string if it exists
        if (body.number) {
            body.number = parseInt(body.number, 10).toString();
        }

        // Only allow admins to update roles.
        if (!isAdminUser && body.role) {
          delete body.role;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: body,
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
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
            return NextResponse.json({ error: 'User ID is required for deletion' }, { status: 400 });
        }

        await prisma.user.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}