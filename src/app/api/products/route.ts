import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id'); 
    const categoryId = searchParams.get('categoryId');
    const name = searchParams.get('name');
    const slug = searchParams.get('slug');
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') as 'price' | 'createdAt' | 'name' | undefined;
    const order = searchParams.get('order') as 'asc' | 'desc' | undefined;
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;

    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid page or limit value' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const where: any = {};

    if (id) {
      const product = await prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          category: true,
          variations: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ products: [product] }); 
    }


    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (slug) {
      where.slug = {
        contains: slug,
        mode: 'insensitive',
      };
    }

    if (minPrice !== undefined) {
      where.price = {
        ...where.price,
        gte: minPrice,
      };
    }

    if (maxPrice !== undefined) {
      where.price = {
        ...where.price,
        lte: maxPrice,
      };
    }

    const orderBy: any = {};

    if (sortBy) {
        orderBy[sortBy] = order === 'desc' ? 'desc' : 'asc';
    } else {
        orderBy.createdAt = 'asc'; 
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        variations: true,
      },
    });

    const totalCount = await prisma.product.count({ where });

    return NextResponse.json({
      products,
      totalCount,
      page,
      limit,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 50 });
  }
}

export async function POST(request: Request) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Extract variations from the body
    const { variations, ...productData } = body;

    // Create the product with nested variations
    const product = await prisma.product.create({
      data: {
        ...productData,
        variations: {
          create: variations.map((variation: { name: string; options: string[] }) => ({
            name: variation.name,
            options: variation.options
          }))
        }
      },
      include: {
        variations: true,
        category: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
            return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { variations, ...productData } = body;

        const updateData: any = {
            ...productData,
        };

        if (variations) {
            updateData.variations = {
                create: variations.create?.map((variation: { name: string; options: string[] }) => ({
                    name: variation.name,
                    options: variation.options,
                })),
                update: variations.update?.map((variation: { id: string; name: string; options: string[] }) => ({
                    where: { id: variation.id },
                    data: {
                        name: variation.name,
                        options: variation.options,
                    },
                })),
                delete: variations.delete?.map((variation: { id: string }) => ({ id: variation.id })),
            };
        }

        const product = await prisma.product.update({
            where: {
                id: id,
            },
            data: updateData,
            include: {
                variations: true,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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
      return NextResponse.json({ error: 'Product ID is required for deletion' }, { status: 400 });
    }

    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}