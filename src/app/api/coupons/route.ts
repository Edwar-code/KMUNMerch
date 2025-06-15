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

        const code = searchParams.get('code');

        const where: any = {};

        if (code) {
            where.code = {
                contains: code,
                mode: 'insensitive',
            };
        }

        const coupons = await prisma.coupon.findMany({
            where,
        });

        return NextResponse.json(coupons);

    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { code, discount, validFrom, validUntil, maxUses } = body;

        if (!code || !discount || !validFrom || !validUntil) {
            return NextResponse.json({ error: 'Code, discount, validFrom, and validUntil are required' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                discount: parseFloat(discount),
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                maxUses: maxUses ? parseInt(maxUses, 10) : null, // Allow maxUses to be null
            },
        });

        return NextResponse.json(coupon, { status: 201 });

    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json({ error: 'Coupon with this code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
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
            return NextResponse.json({ error: 'Coupon ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { code, discount, validFrom, validUntil, maxUses } = body;

        const data: any = {};
        if (code) data.code = code;
        if (discount) data.discount = parseFloat(discount);
        if (validFrom) data.validFrom = new Date(validFrom);
        if (validUntil) data.validUntil = new Date(validUntil);
        if (maxUses) data.maxUses = parseInt(maxUses, 10);
        if (maxUses === null) data.maxUses = null; // Allow setting maxUses to null

        const coupon = await prisma.coupon.update({
            where: {
                id: id,
            },
            data: data,
        });

        return NextResponse.json(coupon);

    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
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
            return NextResponse.json({ error: 'Coupon ID is required for deletion' }, { status: 400 });
        }

        await prisma.coupon.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: 'Coupon deleted successfully' });

    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}