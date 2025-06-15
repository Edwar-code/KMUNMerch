import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthenticated } from '@/lib/auth-utils';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Only allow getting the wishlist for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to access this wishlist' }, { status: 403 });
        }

        const wishlistItems = await prisma.userWishlist.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: true, 
            },
        });

        return NextResponse.json(wishlistItems);

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, productId } = await request.json();

        if (!userId || !productId) {
            return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
        }

        // Only allow adding to the wishlist for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to modify this wishlist' }, { status: 403 });
        }

        const wishlistEntry = await prisma.userWishlist.create({
            data: {
                userId: userId,
                productId: productId,
            },
            include: {
                product: true, 
            },
        });

        return NextResponse.json(wishlistEntry, { status: 201 });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');

        if (!userId || !productId) {
            return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
        }

        // Only allow deleting from the wishlist for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to modify this wishlist' }, { status: 403 });
        }

        await prisma.userWishlist.delete({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });

        return NextResponse.json({ message: 'Product removed from wishlist successfully' });

    } catch (error) {
        console.error('Error deleting from wishlist:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}