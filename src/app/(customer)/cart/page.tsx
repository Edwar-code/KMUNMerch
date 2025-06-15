'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Types
type CartItem = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
  variation?: string | null;
};

type CartSummary = {
  items: CartItem[];
  totalItems: number;
  pricing: {
    subtotal: number;
    formattedSubtotal: string;
    vat: number;
    formattedVAT: string;
    total: number;
    formattedTotal: string;
  };
};

const CartItemSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6 animate-pulse">
    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
      {/* Product Image Skeleton */}
      <div className="h-20 w-20 bg-gray-300 rounded-lg dark:bg-gray-700 md:order-1"></div>

      {/* Product Details Skeleton */}
      <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
        <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded dark:bg-gray-700 w-1/2"></div>
        <div className="flex items-center gap-4">
          <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
          <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
        </div>
      </div>

      {/* Price Skeleton */}
      <div className="text-end md:order-4 md:w-32">
        <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-full"></div>
      </div>
    </div>
  </div>
);

const CartPageSkeleton = () => {
  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-300 rounded dark:bg-gray-700 w-1/2 mb-6 animate-pulse"></div>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          {/* Cart Items Skeleton */}
          <div className="mx-auto w-full flex-none space-y-6 lg:max-w-2xl xl:max-w-4xl">
            {[1, 2, 3].map((item) => (
              <CartItemSkeleton key={item} />
            ))}
          </div>

          {/* Order Summary Skeleton */}
          <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/3 mb-4"></div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                    <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                    <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                  <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                </div>
              </div>

              {/* Checkout Button Skeleton */}
              <div className="h-10 bg-gray-300 rounded-lg dark:bg-gray-700 w-full mt-4"></div>

              {/* Continue Shopping Link Skeleton */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// CartItemCard component
const CartItemCard = ({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (productId: string) => Promise<void>;
}) => {
  const { product } = item;
  const { id: productId, slug, images, name, price } = product;
  const { quantity, variation } = item;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
  }).format(price);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <Link href={`/${slug}`} className="shrink-0 md:order-1">
          <Image
            width={80}
            height={80}
            className="h-20 w-20 object-cover rounded-lg"
            src={images[0]}
            alt={name}
          />
        </Link>

        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {formattedPrice}
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <Link
            href={`/${slug}`}
            className="text-base font-medium text-gray-900 hover:underline dark:text-white"
          >
            {name}
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quantity: {quantity} {variation ? `| Variation: ${variation}` : ''}
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z" />
              </svg>
              Add to Favorites
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('Remove button clicked, product ID:', productId);
                onRemove(productId);
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
}

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Fetch cart data
  const fetchCart = async () => {
    if (status === 'loading' || !session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cart?userId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();

      // Ensure proper mapping of IDs
      const mappedCartItems = data.items.map((item: any) => ({
        id: item._id || item.id,
        product: {
          id: item.product._id || item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          slug: item.product.slug,
        },
        quantity: item.quantity,
        variation: item.variation,
      }));

      console.log('Mapped cart items:', mappedCartItems);
      setCart(mappedCartItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const handleRemoveItem = async (productId: string) => {
    if (!session?.user?.id) return;

    // Add validation
    if (!productId) {
      console.error('Cannot remove item: Product ID is undefined');
      setError('Failed to remove item: Invalid product ID');
      return;
    }

    try {
      console.log('Removing product with ID:', productId);

      const url = new URL('/api/cart', window.location.origin);
      const params = new URLSearchParams();
      params.append('userId', session.user.id);
      params.append('productId', productId);

      url.search = params.toString();
      const deleteUrl = url.toString();

      console.log('DELETE request URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', response.status, errorData);
        throw new Error(`Failed to remove item: ${response.status} ${response.statusText}`);
      }

      // Refresh cart after successful removal
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchCart();
    }
  }, [status, session]);

  const calculateCartSummary = (): CartSummary => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const vatRate = 0.13; // 16% VAT
    const vat = subtotal * vatRate;
    const total = subtotal + vat;

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KES',
      }).format(amount);
    };

    return {
      items: cart,
      totalItems: totalItems,
      pricing: {
        subtotal: subtotal,
        formattedSubtotal: formatCurrency(subtotal),
        vat: vat,
        formattedVAT: formatCurrency(vat),
        total: total,
        formattedTotal: formatCurrency(total),
      },
    };
  };

  const cartSummary = calculateCartSummary();

  if (status === 'loading' || loading) {
    return <CartPageSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl">Please log in to view your cart</p>
        <Link
          href="/login"
          className="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">No items in cart</div>
      </div>
    );
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-200 dark:text-red-800">
            {error}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Shopping Cart ({cartSummary.totalItems} items)
        </h2>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none space-y-6 lg:max-w-2xl xl:max-w-4xl">
            {cart.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Order summary
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <dl className="flex items-center justify-between gap-4">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Subtotal
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {cartSummary.pricing.formattedSubtotal}
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Domain +Hosting +DNS management Renewals.
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {cartSummary.pricing.formattedVAT}
                    </dd>
                  </dl>
                </div>

                <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </dt>
                  <dd className="text-base font-bold text-gray-900 dark:text-white">
                    {cartSummary.pricing.formattedTotal}
                  </dd>
                </dl>
              </div>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Proceed to Checkout
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  or
                </span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                >
                  Continue to checkout
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 12H5m14 0-4 4m4-4-4-4"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
