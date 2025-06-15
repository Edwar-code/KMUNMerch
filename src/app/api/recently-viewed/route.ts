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

        // Only allow getting the recently viewed items for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to access this recently viewed list' }, { status: 403 });
        }

        const recentlyViewedItems = await prisma.userRecentlyViewed.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                viewedAt: 'desc', // Show most recently viewed first
            },
            include: {
                product: true, // Include product details
            },
        });

        return NextResponse.json(recentlyViewedItems);

    } catch (error) {
        console.error('Error fetching recently viewed products:', error);
        return NextResponse.json({ error: 'Failed to fetch recently viewed products' }, { status: 500 });
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

        // Only allow adding to the recently viewed list for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to modify this recently viewed list' }, { status: 403 });
        }

        // Check if the product is already in the recently viewed list
        const existingEntry = await prisma.userRecentlyViewed.findUnique({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });

        if (existingEntry) {
            // Update the viewedAt timestamp if the product is already in the list
            await prisma.userRecentlyViewed.update({
                where: {
                    userId_productId: {
                        userId: userId,
                        productId: productId,
                    },
                },
                data: {
                    viewedAt: new Date(),
                },
            });

            return NextResponse.json({ message: 'Recently viewed product updated' });
        } else {
            // Create a new entry if the product is not in the list
            const recentlyViewedEntry = await prisma.userRecentlyViewed.create({
                data: {
                    userId: userId,
                    productId: productId,
                },
                include: {
                    product: true, // Include product details
                },
            });

            return NextResponse.json(recentlyViewedEntry, { status: 201 });
        }

    } catch (error) {
        console.error('Error adding to recently viewed:', error);
        return NextResponse.json({ error: 'Failed to add to recently viewed' }, { status: 500 });
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

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Only allow deleting from the recently viewed list for the currently logged-in user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to modify this recently viewed list' }, { status: 403 });
        }

        if (productId) {
            // Remove a single product
            await prisma.userRecentlyViewed.delete({
                where: {
                    userId_productId: {
                        userId: userId,
                        productId: productId,
                    },
                },
            });

            return NextResponse.json({ message: 'Product removed from recently viewed list successfully' });
        } else {
            // Clear the entire list
            await prisma.userRecentlyViewed.deleteMany({
                where: {
                    userId: userId,
                },
            });

            return NextResponse.json({ message: 'Recently viewed list cleared successfully' });
        }

    } catch (error) {
        console.error('Error deleting from recently viewed:', error);
        return NextResponse.json({ error: 'Failed to remove from recently viewed' }, { status: 500 });
    }
}