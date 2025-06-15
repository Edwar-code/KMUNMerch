'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Types 
type WishlistItem = {
  product: {
    _id: string;
    name: string;
    price: number;
    formattedPrice: string;
    images: string[];
    slug: string;
    description: string;
  };
};

type WishlistSummary = {
  items: WishlistItem[];
  totalItems: number;
};

const WishlistItemSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse dark:border-gray-700 dark:bg-gray-800 md:p-6">
    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
      {/* Image Placeholder */}
      <div className="shrink-0 md:order-1">
        <div className="h-20 w-20 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between md:order-3 md:justify-end">
        <div className="text-end md:order-4 md:w-32">
          <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-24"></div>
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
        {/* Product Name */}
        <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded dark:bg-gray-700 w-full"></div>
          <div className="h-4 bg-gray-300 rounded dark:bg-gray-700 w-5/6"></div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-24"></div>
          <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

const WishlistPageSkeleton = () => {
  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-300 rounded dark:bg-gray-700 w-1/2 mb-6"></div>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none space-y-6 lg:max-w-2xl xl:max-w-4xl">
            {/* Multiple Skeleton Items */}
            {[1, 2, 3].map((item) => (
              <WishlistItemSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// WishlistItemCard component
const WishlistItemCard = ({ 
  item, 
  onRemove 
}: { 
  item: WishlistItem; // Changed type to WishlistItem
  onRemove: (productId: string) => Promise<void>;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
      <Link href={`/${item.product.slug}`} className="shrink-0 md:order-1">
        <Image 
          width={80} 
          height={80} 
          className="h-20 w-20 object-cover rounded-lg" 
          src={item.product.images[0]} 
          alt={item.product.name} 
        />
      </Link>

      <div className="flex items-center justify-between md:order-3 md:justify-end">
        <div className="text-end md:order-4 md:w-32">
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {item.product.price}
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
        <Link 
          href={`/${item.product.slug}`} 
          className="text-base font-medium text-gray-900 hover:underline dark:text-white"
        >
          {item.product.name}
        </Link>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
        {item.product.description.length > 128 
                                        ? `${item.product.description.substring(0, 128)}...` 
                                        : item.product.description}
        </p>

        <div className="flex items-center gap-4">
        <button
  type="button"
  onClick={() => (window.location.href = `/${item.product.slug}`)}
  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
>
  Add to Cart
</button>


          <button 
            type="button" 
            onClick={() => {
              console.log('Removing product with ID:', item.product._id); // Debug log
              onRemove(item.product._id);
            }}
            className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
          >
            <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
);

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchWishlist = async () => {
    if (status === 'loading' || !session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?userId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();

      // Map the data to match WishlistItem type and ensure _id is present
      const mappedWishlistItems = data.map((item: any) => ({
        product: {
          _id: item.product._id || item.product.id, // Use either _id or id
          name: item.product.name,
          price: item.product.price,
          formattedPrice: item.product.formattedPrice,
          images: item.product.images,
          slug: item.product.slug,
          description: item.product.description,
        },
      }));

      console.log('Fetched wishlist data:', mappedWishlistItems);
      setWishlistItems(mappedWishlistItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
  if (!session?.user?.id || !productId) {
    console.error('Missing userId or productId', { userId: session?.user?.id, productId });
    return;
  }

  try {
    console.log('Removing product with ID:', productId);

    // Construct the URL with query parameters
    const url = new URL('/api/wishlist', window.location.origin);
    const params = new URLSearchParams();
    params.append('userId', session.user.id);
    params.append('productId', productId);
    url.search = params.toString();
    const deleteUrl = url.toString();

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to remove item');
    
    await fetchWishlist(); // Refresh the wishlist after removal
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to remove item');
  }
};

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchWishlist();
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <WishlistPageSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl">Please log in to view your wishlist</p>
        <Link 
          href="/login" 
          className="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">No Tickets in wishlist</div>
      </div>
    );
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Wishlist ({wishlistItems.length} items)
        </h2>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none space-y-6 lg:max-w-2xl xl:max-w-4xl">
            {wishlistItems.map((item) => (
              <WishlistItemCard 
                key={item.product._id} 
                item={item} 
                onRemove={handleRemoveItem} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishlistPage;
