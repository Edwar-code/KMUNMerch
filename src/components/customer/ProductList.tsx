'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Alert as AlertComponent, AlertTitle as AlertTitleComponent, AlertDescription as AlertDescriptionComponent, RandomAlert as RandomAlertComponent } from './alert';
import { useState, useEffect } from 'react';


import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

interface ProductListProps {
    products: Product[];
    totalCount: number;
    initialPage: number;
    productsPerPage: number;
}

interface ProductAlertProps {
    children: ReactNode;
    className: string;
}

const ProductAlert: React.FC<ProductAlertProps> = ({ children, className }) => {
    return (
        <div className={`bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg text-sm flex flex-col gap-0.5 ${className}`}>
            {children}
        </div>
    );
};

const ProductAlertTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <h3 className="font-semibold text-sm leading-tight">{children}</h3>;
};

const ProductAlertDescription: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <p className="leading-snug text-xs text-gray-300">{children}</p>;
};

const ProductRandomAlert: React.FC = () => {
     const messages = [
    "🗣️ Motion to nap—sponsored by everyone.",
    "🧠 Brain: 1%. Confidence: 100%. Let’s debate!",
    "🛎️ Crisis? Perfect. I thrive in chaos.",
    "🫣 Did I just reference the wrong country? Again?",
    "🎭 UN procedures are my toxic trait.",
    "🌍 Saving the world, one unmoderated caucus at a time.",
    "🎤 Mic drop... after my country’s right of reply.",
    "🤝 Friends today, geopolitical enemies tomorrow.",
    "🕊️ Peace talks powered by iced coffee.",
    "✋ Point of order: I’m confused but confident.",
    "📜 My resolution? Sleep more. UN says no.",
    "👀 Drafting resolutions like it's a group project I care about.",
    "🫡 Delegate of Kenya, reporting for caffeine duty.",
    "🧃 Diplomatic immunity does not apply to late-night stress.",
    "🤓 This position paper wrote itself. (Lies)",
    "🥴 Why debate? For the snacks.",
    "💬 If you don’t know the rules, just speak louder.",
    "👔 Dressed like a diplomat, crying like a student.",
    "📢 Moderated caucus? More like chaos caucus.",
    "🧍 Unmoderated caucus = introvert’s nightmare.",
    "🔥 Burnt out but still submitting amendments.",
    "🕰️ It’s giving... Geneva Convention chic.",
    "🤪 Rule of Procedure? Never heard of her.",
    "🌐 Diplomacy: the original group chat.",
    "💼 Running on vibes and country policy.",
    "🫀 Heart says delegate. Brain says delegate too much.",
    "💔 Lost my allies. Gained experience points.",
    "🎉 Social night: where treaties are forgotten.",
    "🎓 UN-certified overthinker.",
    "🔍 Searching for consensus like it’s lost WiFi.",
    "📣 Speech time? I black out, then applause.",
    "😩 Draft resolutions are my sleep paralysis demon.",
    "🛬 Flying into debate mode with no parachute.",
    "👩‍⚖️ Committee drama > Netflix.",
    "📆 My calendar just says ‘caucus.’",
    "😵‍💫 Am I in a bloc or just emotionally lost?",
    "✍️ Signed by 20 delegates, read by none.",
    "🧩 UNSC = Unlimited Stress & Chaos.",
    "🧃 Water break? More like identity crisis.",
    "💬 One speech away from a diplomatic breakthrough… or breakdown."
  ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return (
        <ProductAlert className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 max-w-lg">
            <ProductAlertTitle>Heads up!</ProductAlertTitle>
            <ProductAlertDescription>{randomMessage}</ProductAlertDescription>
        </ProductAlert>
    );
};

export const ProductList: React.FC<ProductListProps> = ({ products, totalCount, initialPage, productsPerPage }) => {
    const { data: session } = useSession();
    const userID = session?.user?.id;
    const router = useRouter();

    const [displayedProducts, setDisplayedProducts] = useState<Product[]>(products);
    const [wishlist, setWishlist] = useState<{ [key: string]: boolean }>({});
    const [loadingWishlist, setLoadingWishlist] = useState<{ [key: string]: boolean }>({});
    const [randomImages, setRandomImages] = useState<{ [productId: string]: string }>({});
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [showRandomAlert, setShowRandomAlert] = useState(false);

    // Update displayed products when the products prop changes
    useEffect(() => {
        setDisplayedProducts(products);
    }, [products]);

    useEffect(() => {
        const initialRandomImages: { [productId: string]: string } = {};
        products.forEach((product: Product) => {
            initialRandomImages[product.id] = product.images[Math.floor(Math.random() * product.images.length)];
        });
        setRandomImages(initialRandomImages);
    }, [products]);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (userID) {
                try {
                    const response = await fetch(`/api/wishlist?userId=${userID}`);
                    const data = await response.json();
                    const wishlistState = data.reduce((acc: any, item: any) => {
                        acc[item.productId] = true;
                        return acc;
                    }, {});
                    setWishlist(wishlistState);
                } catch (error) {
                    console.error('Error fetching wishlist:', error);
                }
            }
        };

        fetchWishlist();
    }, [userID]);

    const handleWishlistToggle = async (productId: string) => {
        if (!session?.user?.id) {
            toast.error('Please log in to add items to wishlist');
            router.push('/');
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

    const handleLoadMore = () => {
        setCurrentPage((prev) => prev + 1);
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', (currentPage + 1).toString());
        router.push(`/?${queryParams.toString()}`);
    };

    // Effect to trigger random alert at intervals
    useEffect(() => {
        const randomInterval = setInterval(() => {
            setShowRandomAlert(true);
            setTimeout(() => {
                setShowRandomAlert(false);
            }, 3000); // Hide after 3 seconds
        }, Math.random() * 5000 + 5000); // Random interval between 5 and 10 seconds

        return () => clearInterval(randomInterval); // Cleanup the interval on unmount
    }, []);

    return (
        <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loading ? (
                    [...Array(productsPerPage)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-300 rounded-lg h-48"></div>
                    ))
                ) : (
                    displayedProducts.map((product) => {
                        const imageToShow = randomImages[product.id] || product.images[0];
                        return (
                            <div
                                key={product.slug}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="h-48 w-full overflow-hidden group relative">
                                    <Link href={`/${product.slug}`}>
                                        <Image
                                            width={430}
                                            height={224}
                                            className="mx-auto h-full w-full object-cover object-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                                            src={imageToShow}
                                            alt={product.name}
                                            loader={() => imageToShow}
                                            unoptimized
                                        />
                                    </Link>
                                </div>

                                <div className="pt-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {product.category.name}
                                        </span>

                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleWishlistToggle(product.id)}
                                                type="button"
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
                                        <p className="text-xl font-bold leading-tight text-gray-900 dark:text-primary-700">
                                            {`Ksh. ${product.price}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
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
            {showRandomAlert && <ProductRandomAlert />}
        </>
    );
};
