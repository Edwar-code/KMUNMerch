import { NextResponse } from 'next/server';
import { UserRole, OrderStatus, PaymentMethod, PaymentStatus, TicketStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // User Analytics
        const totalUsers = await prisma.user.count();
        const customerCount = await prisma.user.count({ where: { role: UserRole.customer } });
        const adminCount = await prisma.user.count({ where: { role: UserRole.admin } });
        const newUsersLast7Days = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });

        const usersByLocation = await prisma.user.aggregateRaw({
            pipeline: [
                { $group: { _id: { countryId: "$countryId", countyId: "$countyId", cityId: "$cityId" }, count: { $sum: 1 } } }
            ]
        });

        // Product Analytics
        const totalProducts = await prisma.product.count();
        const productsWithLowStock = await prisma.product.count({ where: { stock: { lte: 10 } } });
        const averageProductPrice = await prisma.product.aggregate({ _avg: { price: true } });

        const mostViewedProducts = await prisma.userRecentlyViewed.aggregateRaw({
            pipeline: [
                { $group: { _id: "$productId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]
        });

        const mostWishlistedProducts = await prisma.userWishlist.aggregateRaw({
            pipeline: [
                { $group: { _id: "$productId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]
        });

        // Category Analytics
        const totalCategories = await prisma.category.count();
        const productsPerCategory = await prisma.category.findMany({
            select: {
                name: true,
                _count: { select: { products: true } }
            }
        });

        // Order Analytics
        const ordersByCountry = await prisma.order.aggregateRaw({
            pipeline: [
                { $group: { _id: "$countryId", count: { $sum: 1 } } }
            ]
        });

        const salesByHour = await prisma.order.aggregateRaw({
            pipeline: [
                { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 }, revenue: { $sum: "$total" } } }
            ]
        });

        const peakOrderTimes = await prisma.order.aggregateRaw({
            pipeline: [
                { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]
        });

        // Review and Rating Analytics
        const ratingDistribution = await prisma.review.aggregateRaw({
            pipeline: [
                { $group: { _id: "$rating", count: { $sum: 1 } } }
            ]
        });

        const mostReviewedProducts = await prisma.review.aggregateRaw({
            pipeline: [
                { $group: { _id: "$productId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]
        });

        return NextResponse.json({
            userAnalytics: { totalUsers, customerCount, adminCount, newUsersLast7Days, usersByLocation },
            productAnalytics: { totalProducts, productsWithLowStock, averageProductPrice: averageProductPrice._avg.price || 0, mostViewedProducts, mostWishlistedProducts },
            categoryAnalytics: { totalCategories, productsPerCategory },
            orderAnalytics: { ordersByCountry, salesByHour, peakOrderTimes },
            reviewAnalytics: { ratingDistribution, mostReviewedProducts }
        });

    } catch (error) {
        const err = error as any;
        console.error('Error fetching analytics:', err.message, err.stack);
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
