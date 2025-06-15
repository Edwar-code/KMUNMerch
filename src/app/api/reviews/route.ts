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
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId: productId,
            },
            include: {
                user: true // Include user information
            },
            orderBy: {
                createdAt: 'desc' // Show newest reviews first
            }
        });

        return NextResponse.json(reviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, productId, rating, comment } = await request.json();

        if (!userId || !productId || !rating) {
            return NextResponse.json({ error: 'User ID, Product ID, and Rating are required' }, { status: 400 });
        }

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to create review for this user' }, { status: 403 });
        }

        const newReview = await prisma.review.create({
            data: {
                userId: userId,
                productId: productId,
                rating: parseInt(rating, 10), // Ensure rating is an integer
                comment: comment, // Allow null or undefined comment
            },
            include: {
                user: true
            }
        });

        return NextResponse.json(newReview, { status: 201 });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { rating, comment } = body;

        // Fetch the existing review to check the user ID
        const existingReview = await prisma.review.findUnique({
            where: {
                id: id,
            },
        });

        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (existingReview.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to update this review' }, { status: 403 });
        }

        const data: any = {};
        if (rating) data.rating = parseInt(rating, 10);  //Rating must be an integer
        if (comment) data.comment = comment;

        const updatedReview = await prisma.review.update({
            where: {
                id: id,
            },
            data: data,
            include: {
                user: true
            }
        });

        return NextResponse.json(updatedReview);

    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        // Fetch the existing review to check the user ID
        const existingReview = await prisma.review.findUnique({
            where: {
                id: id,
            },
        });

        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (existingReview.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 });
        }

        await prisma.review.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}