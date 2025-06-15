import { NextResponse } from 'next/server';
import { LocationType } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

// GET: Fetch locations with optional filtering and sorting
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const typeParam = searchParams.get('type')?.toLowerCase();
        const type = typeParam as LocationType | undefined;
        const id = searchParams.get('id'); // Extract the id parameter
        const countryId = searchParams.get('countryId');
        const countyId = searchParams.get('countyId');
        const cityId = searchParams.get('cityId');
        const sortBy = searchParams.get('sortBy') || 'name';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        // Build the where clause
        const where: any = {};
        if (type && Object.values(LocationType).includes(type as LocationType)) {
            where.type = type;
        }
        if (id) {
            where.id = id;  // Add the ID to the where clause
        }
        if (countryId) {
            where.countryId = countryId;
        }
        if (countyId) {
            where.countyId = countyId;
        }
        if (cityId) {
            where.cityId = cityId;
        }

        // Fetch the locations without pagination, but still with sorting
        const locations = await prisma.location.findMany({
            where,
            orderBy: {
                [sortBy]: sortOrder,
            },
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json({ error: 'Failed to fetch locations', details: error }, { status: 500 });
    }
}

// POST: Create a new location
export async function POST(request: Request) {
    try {
        const isAdminUser = await isAdmin();
        if (!isAdminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, type, shippingCost, countryId, countyId, cityId } = body;

        if (!name || !type || !Object.values(LocationType).includes(type)) {
            return NextResponse.json({ error: 'Valid name and type are required' }, { status: 400 });
        }

        // Validate shippingCost
        if (shippingCost && (isNaN(shippingCost) || shippingCost < 0)) {
            return NextResponse.json({ error: 'Shipping cost must be a non-negative number' }, { status: 400 });
        }

        // Validate hierarchical relationships
        if (type === 'county' && !countryId) {
            return NextResponse.json({ error: 'Country ID is required for county' }, { status: 400 });
        }
        if (type === 'city' && !countyId) {
            return NextResponse.json({ error: 'County ID is required for city' }, { status: 400 });
        }

        // Create the location
        const location = await prisma.location.create({
            data: {
                name,
                type,
                shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
                country: type === 'county' || type === 'city' ? { connect: { id: countryId } } : undefined,
                county: type === 'city' ? { connect: { id: countyId } } : undefined,
                city: type === 'subCity' ? { connect: { id: cityId } } : undefined,
            },
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        console.error('Error creating location:', error);
        return NextResponse.json({ error: 'Failed to create location', details: error }, { status: 500 });
    }
}

// PUT: Update an existing location
export async function PUT(request: Request) {
    try {
        const isAdminUser = await isAdmin();
        if (!isAdminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Location ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { name, type, shippingCost, countryId, countyId, cityId } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (type && Object.values(LocationType).includes(type)) updateData.type = type;
        if (shippingCost !== undefined) {
            if (isNaN(shippingCost) || shippingCost < 0) {
                return NextResponse.json({ error: 'Shipping cost must be a non-negative number' }, { status: 400 });
            }
            updateData.shippingCost = parseFloat(shippingCost);
        }

        // Validate hierarchical relationships
        if (type === 'county' && !countryId) {
            return NextResponse.json({ error: 'Country ID is required for county' }, { status: 400 });
        }
        if (type === 'city' && !countyId) {
            return NextResponse.json({ error: 'County ID is required for city' }, { status: 400 });
        }

        if (countryId) updateData.countryId = countryId;
        if (countyId) updateData.countyId = countyId;
        if (cityId) updateData.cityId = cityId;

        // Update the location
        const location = await prisma.location.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json({ error: 'Failed to update location', details: error }, { status: 500 });
    }
}

// DELETE: Delete a location (only if it is not referenced by users or orders)
export async function DELETE(request: Request) {
    try {
        const isAdminUser = await isAdmin();
        if (!isAdminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Location ID is required for deletion' }, { status: 400 });
        }

        // Check if the location is referenced by any users or orders
        const usersWithLocation = await prisma.user.findFirst({
            where: {
                OR: [
                    { countryId: id },
                    { countyId: id },
                    { cityId: id }
                ]
            }
        });

        const ordersWithLocation = await prisma.order.findFirst({
            where: {
                OR: [
                    { countryId: id },
                    { countyId: id },
                    { cityId: id }
                ]
            }
        });

        // Check if the location is referenced by any hierarchical relationships
        const hierarchicalReferences = await prisma.location.findFirst({
            where: {
                OR: [
                    { countryId: id },
                    { countyId: id },
                    { cityId: id }
                ]
            }
        });

        if (usersWithLocation || ordersWithLocation || hierarchicalReferences) {
            return NextResponse.json({ error: 'Cannot delete location that is referenced by users, orders, or other locations' }, { status: 400 });
        }

        // Delete the location
        await prisma.location.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        return NextResponse.json({ error: 'Failed to delete location', details: error }, { status: 500 });
    }
}