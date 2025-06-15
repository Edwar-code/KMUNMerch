import { cache } from 'react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import Link from "next/link";
import Hero from '@/components/customer/Hero';

import { FaUserPlus, FaFileAlt, FaChartLine } from "react-icons/fa";
import { CategoryList } from '@/components/customer/CategoryList';
import { ProductList } from '@/components/customer/ProductList';
import { Filters } from '@/components/customer/Filters';
import { UserDetailsDialog } from '@/components/customer/UserDetailsDialog';

export const dynamic = "force-dynamic";

interface Category {
    id: string;
    name: string;
    image: string;
    slug: string;
}

type Product = {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    images: string[];
    stock: number;
    category: {
        id: string;
        name: string;
    };
};

interface HeroProps {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    isActive: boolean;
}

const PRODUCTS_PER_PAGE = 20;

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const getCategories = cache(async (): Promise<Category[]> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/categories`, {
            cache: 'force-cache',
        });

        if (!res.ok) {
            console.error('Failed to fetch categories:', await res.text());
            return [];
        }

        return shuffleArray(await res.json());
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
});

const getHeros = cache(async (): Promise<HeroProps[]> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/heros`, {
            cache: 'force-cache',
        });

        if (!res.ok) {
            console.error('Failed to fetch heros:', await res.text());
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching heros:', error);
        return [];
    }
});

const getProducts = cache(
    async (
        categoryId: string | null,
        minPrice: number | undefined,
        maxPrice: number | undefined,
        sortBy: 'price' | 'createdAt' | 'name',
        order: 'asc' | 'desc',
        page: number,
        limit: number
    ): Promise<{ products: Product[]; totalCount: number }> => {
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append('categoryId', categoryId);
            if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
            if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
            params.append('sortBy', sortBy);
            params.append('order', order);
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/products?${params.toString()}`,
                {
                    cache: 'no-store',
                }
            );

            if (!response.ok) {
                console.error('Failed to fetch products:', await response.text());
                return { products: [], totalCount: 0 };
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { products: [], totalCount: 0 };
        }
    }
);

// Main page component
export default async function Home() {
    const categories = await getCategories();
    const heros = await getHeros();

    const { products, totalCount } = await getProducts(
        null,
        undefined,
        undefined,
        'createdAt',
        'desc',
        1,
        PRODUCTS_PER_PAGE
    );

    const shuffledProducts = shuffleArray(products);

    return (
        <>
            <Navbar />
            <Hero />
            <main className="bg-gray-50 py-8 antialiased dark:bg-gray-900 md:py-12">
                <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                    {/* Navigation Buttons */}
                    <Navigation />
                    
                    {/* Categories and Events Section */}
                    <CategoryList categories={categories} />
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl mb-4">
                            Events
                        </h2>
                        <Filters
                            categories={categories}
                            initialCategory={''}
                            initialSortBy={'createdAt'}
                            initialOrder={'desc'}
                            initialMinPrice={undefined}
                            initialMaxPrice={undefined}
                        />
                        <ProductList
                            products={shuffledProducts}
                            totalCount={totalCount}
                            initialPage={1}
                            productsPerPage={PRODUCTS_PER_PAGE}
                        />
                    </section>
                </div>
            </main>
            <Footer />
            <UserDetailsDialog />
        </>
    );
}


function Navigation() {
  const navItems = [
    {
      href: "/new-member",
      label: "New Member",
      icon: <FaUserPlus className="mr-2 text-lg" />,
    },
    {
      href: "/meeting-reports",
      label: "Meeting Reports",
      icon: <FaFileAlt className="mr-2 text-lg" />,
    },
    {
      href: "/financial-reports",
      label: "Finance Reports",
      icon: <FaChartLine className="mr-2 text-lg" />,
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
      {navItems.map(({ href, label, icon }) => (
        <Link key={href} href={href} passHref>
          <a className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-white font-semibold shadow-xl backdrop-blur-md hover:bg-white/20 transition-all hover:scale-[1.03]">
            {icon}
            <span className="text-base sm:text-lg">{label}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}

