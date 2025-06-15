'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Category = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
};

const CategoryPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  const CATEGORIES_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories'); 
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;

    const moreCategories = categories.slice(startIndex, Math.min(endIndex, categories.length));


    setCategories((prev) => [...prev, ...moreCategories]);
    setCurrentPage(nextPage);
  };

  const SkeletonItem = () => (
    <div className="group relative block overflow-hidden rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 animate-pulse">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-300 dark:bg-gray-700"></div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-gray-50 py-8 antialiased dark:bg-gray-900 md:py-12">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
          <div>
            <h2 className="hidden mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Category
            </h2>
          </div>
        </div>
        <div className="mb-4 grid gap-4 grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            [...Array(CATEGORIES_PER_PAGE)].map((_, index) => <SkeletonItem key={index} />)
          ) : (
            categories.slice(0, CATEGORIES_PER_PAGE * currentPage).map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className="group relative block overflow-hidden rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={category.image}
                            alt={category.name}
                            width={430}
                      height={224}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {category.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
        {categories.length > CATEGORIES_PER_PAGE * currentPage && (
          <div className="w-full text-center">
            <button
              onClick={handleLoadMore}
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;