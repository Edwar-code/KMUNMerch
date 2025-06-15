import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      select: {
        name: true,
      },
      take: 5, // Limit to 5 suggestions
    });

    interface ProductSuggestion {
      name: string;
    }
    const suggestions: string[] = products.map((product: ProductSuggestion) => product.name);

    return NextResponse.json({ results: suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch search suggestions' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}