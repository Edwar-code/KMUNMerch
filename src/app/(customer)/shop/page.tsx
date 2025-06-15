'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

const ProductPageContentWrapper = () => {
  return (
    <Suspense>
      <ProductPageContent />
    </Suspense>
  );
};

const ProductPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userID = session?.user?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<{ [key: string]: boolean }>({});
  const [loadingWishlist, setLoadingWishlist] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [
    categories,
    setCategories,
  ] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    searchParams.get('category') || ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<
    'price' | 'createdAt' | 'name'
  >((searchParams.get('sortBy') as 'price' | 'createdAt' | 'name') ||
    'createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'asc'
  );

  // Pagination
  const PRODUCTS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Determine category ID from slug
  useEffect(() => {
    if (selectedCategorySlug && selectedCategorySlug !== "all") {
      const category = categories.find(cat => cat.slug === selectedCategorySlug);
      if (category) {
        setSelectedCategoryId(category.id);
      } else {
        setSelectedCategoryId(null); 
      }
    } else {
      setSelectedCategoryId(null);
    }
  }, [selectedCategorySlug, categories]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        if (selectedCategoryId) params.append('categoryId', selectedCategoryId);
        if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
        if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
        params.append('sortBy', sortBy);
        params.append('order', order);
        params.append('page', currentPage.toString());
        params.append('limit', PRODUCTS_PER_PAGE.toString());

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        setProducts(data.products);
        setTotalCount(data.totalCount);
        setDisplayedProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchTerm,
    selectedCategoryId,
    minPrice,
    maxPrice,
    sortBy,
    order,
    currentPage,
  ]);

  // Wishlist Fetch and Toggle
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist');
        const data = await response.json();
        const wishlistState = data.reduce((acc: any, item: any) => {
          acc[item.productId] = true;
          return acc;
        }, {});
        setWishlist(wishlistState);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  const handleWishlistToggle = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error('Please log in to add items to cart');
      router.push('/login');
      return;
    }

    setLoadingWishlist((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(
        `/api/wishlist?userId=${userID}&productId=${productId}`,
        {
          method: wishlist[productId] ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userID,
            productId: productId,
          }),
        }
      );

      const data: { message?: string } = await response.json();

      if (response.ok) {
        setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));

        // Success toasts based on method
        if (wishlist[productId]) {
          toast.success('Removed from wishlist');
        } else {
          toast.success(data.message || 'Added to wishlist');
        }
      } else {
        toast.error(data.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoadingWishlist((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Search, Filter, and Sort Handlers
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    router.push(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryChange = (categorySlug: string) => {
    setCurrentPage(1);
    setSelectedCategorySlug(categorySlug === "all" ? "" : categorySlug);
    router.push(`/?category=${encodeURIComponent(categorySlug === "all" ? "" : categorySlug)}`);
  };

  const handleSortByChange = (value: 'price' | 'createdAt' | 'name') => {
    setCurrentPage(1);
    setSortBy(value);
    router.push(`/?sortBy=${encodeURIComponent(value)}`);
  };

  const handleOrderChange = (value: 'asc' | 'desc') => {
    setCurrentPage(1);
    setOrder(value);
    router.push(`/?order=${encodeURIComponent(value)}`);
  };

  const handlePriceFilterChange = () => {
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategorySlug) params.append('category', selectedCategorySlug);
    if (minPrice !== undefined)
      params.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined)
      params.append('maxPrice', maxPrice.toString());
    params.append('sortBy', sortBy);
    params.append('order', order);
    router.push(`/?${params.toString()}`);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Skeleton Component
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
        {/* ===== Heading & Filters ===== */}
        <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
          <div>
            <h2 className="hidden mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Shop
            </h2>
          </div>


          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                <svg
                  className="-ms-0.5 me-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
                  />
                </svg>
                Filters
                <svg
                  className="-me-0.5 ms-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Products</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={handleCategoryChange}
                      defaultValue={selectedCategorySlug || "all"}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="minPrice">Min Price</Label>
                    <input
                      type="number"
                      id="minPrice"
                      className="col-span-3 flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-500"
                      value={minPrice || ''}
                      onChange={(e) =>
                        setMinPrice(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxPrice">Max Price</Label>
                    <input
                      type="number"
                      id="maxPrice"
                      className="col-span-3 flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-500"
                      value={maxPrice || ''}
                      onChange={(e) =>
                        setMaxPrice(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <button
                    onClick={handlePriceFilterChange}
                    type="button"
                    className="inline-flex items-center rounded-lg bg-primary-700 px-3 py-2 text-xs font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <Select
              onValueChange={handleSortByChange}
              defaultValue={sortBy}
            >
              <SelectTrigger className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                <svg
                  className="-ms-0.5 me-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4"
                  />
                </svg>
                Sort
                <svg
                  className="-me-0.5 ms-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleOrderChange} defaultValue={order}>
              <SelectTrigger className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                Order
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4 grid gap-4 grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            [...Array(PRODUCTS_PER_PAGE)].map((_, index) => (
              <SkeletonItem key={index} />
            ))
          ) : (
            displayedProducts.map((product) => (
              <div
                key={product.slug}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="h-48 w-full overflow-hidden">
                  <Link href={`/${product.slug}`}>
                    <Image
                      width={430}
                      height={224}
                      className="mx-auto h-full object-cover object-center rounded-lg"
                      src={product.images[0]}
                      alt={product.name}
                    />
                  </Link>
                </div>

                <div className="pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                      {product.category.name}
                    </span>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        data-tooltip-target="tooltip-quick-look"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">Quick look</span>
                        <svg
                          className="h-4 w-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                          />
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleWishlistToggle(product.id)}
                        type="button"
                        data-tooltip-target="tooltip-add-to-wishlist"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">
                          {loadingWishlist[product.id]
                            ? 'Adding...'
                            : wishlist[product.id]
                            ? 'Remove from Wishlist'
                            : 'Add to Wishlist'}
                        </span>
                        <svg
                          className="h-4 w-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill={wishlist[product.id] ? 'red' : 'none'}
                          viewBox="0 0 24 24"
                          stroke={wishlist[product.id] ? 'red' : 'currentColor'}
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <Link
                    href={`/${product.slug}`}
                    className="block text-base font-semibold leading-tight text-gray-900 hover:underline dark:text-white mb-2"
                  >
                    {product.name}
                  </Link>
                  
<div className="mt-2 flex items-center justify-between gap-2">
<p className="text-xl font-extrabold leading-tight text-gray-900 dark:text-white">
  {Number(product.price) === 0 ? 'Free' : `Ksh. ${product.price}`}
</p>
                    <button
                      onClick={() => router.push(`/${product.slug}`)}
                      type="button"
                      className="inline-flex items-center rounded-lg bg-primary-700 px-3 py-2 text-xs font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                      <svg
                        className="-ms-1 me-1 h-4 w-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                        />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalCount > displayedProducts.length && (
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

export default ProductPageContentWrapper;
