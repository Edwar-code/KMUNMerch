'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';


interface ProductInfoClientProps {
    product: Product | null;
    availableStockProps: number
}


interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    variations?: Array<{
        id: string;
        name: string;
        options: string[];
        stock?: number;
    }>;
    stock: number;
}


const ProductInfoClient: React.FC<ProductInfoClientProps> = ({ product, availableStockProps }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const userID = session?.user.id;
    const pathname = usePathname();


    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [quantity, setQuantity] = useState(1);
    const [availableStock, setAvailableStock] = useState(availableStockProps || 0);

    const [wishlist, setWishlist] = useState<{ [key: string]: boolean }>({});
    const [loadingWishlist, setLoadingWishlist] = useState<{ [key: string]: boolean }>({});

    const [Adding, setAdding] = useState(false);

    const handleGoogleSignIn = async () => {
            try {
                const result = await signIn('google', { callbackUrl: pathname }); 
                if (result?.error) {
                    toast.error("Failed to sign in with Google");
                }
            } catch (error) {
                console.error("Google sign-in error:", error);
                toast.error("An unexpected error occurred during Google sign-in.");
            }
        };

    const updateAvailableStock = useCallback(
        (options: { [key: string]: string }) => {
            if (!product) return;

            let matchingStock = product.stock;

            // If variations exist and have options, try to find matching stock based on selected options
            if (product.variations && product.variations.length > 0) {
                const matchingVariation = product.variations.find((variation) => {
                    let match = true;
                    for (const variationName in options) {
                        if (options.hasOwnProperty(variationName)) {
                            const selectedOption = options[variationName];
                            const variationForOption = product.variations?.find((v) => v.name === variationName);

                            if (variationForOption && !variationForOption.options.includes(selectedOption)) {
                                match = false;
                                break;
                            }
                        }
                    }
                    return match;
                });

                if (matchingVariation && matchingVariation.stock !== undefined) {
                    matchingStock = matchingVariation.stock;
                }
            }

            setAvailableStock(matchingStock);
        },
        [product]
    );

    useEffect(() => {
        if (product && product.variations && product.variations.length > 0) {
            // Initialize selectedOptions with the first option of each variation
            const initialOptions: { [key: string]: string } = {};
            product.variations.forEach((variation: any) => {
                if (variation.options && variation.options.length > 0) {
                    initialOptions[variation.name] = variation.options[0];
                }
            });
            setSelectedOptions(initialOptions);
            updateAvailableStock(initialOptions); 
        }
    }, [product, updateAvailableStock]);


    useEffect(() => {
        if (availableStockProps) {
            setAvailableStock(availableStockProps);
        }
    }, [availableStockProps]);


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

    const handleWishlistToggle = async (_id: string) => {
        if (!session?.user?.id) {
            toast.error('Please log in to add items to cart');
            handleGoogleSignIn();
            return;
        }

        setLoadingWishlist((prev) => ({ ...prev, [_id]: true }));
        try {
            const response = await fetch(`/api/wishlist`, {
                method: wishlist[_id] ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userID,
                    productId: _id
                }),
            });

            const data: { message?: string } = await response.json();

            if (response.ok) {
                setWishlist((prev) => ({ ...prev, [_id]: !prev[_id] }));

                // Success toasts based on method
                if (wishlist[_id]) {
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
            setLoadingWishlist((prev) => ({ ...prev, [_id]: false }));
        }
    };

    const handleAddToCart = async () => {
        if (!session?.user?.id) {
            toast.error('Please log in to add items to cart');
            handleGoogleSignIn();
            return;
        }

        if (!product) {
            toast.error('Product not found');
            return;
        }

        setAdding(true);

        try {
            interface CartPayload {
                userId: string | undefined;
                productId: string;
                quantity: number;
                variation?: string;
            }

            const payload: CartPayload = {
                userId: userID,
                productId: product.id,
                quantity: quantity,
            };

            // Add variations to the payload only if variations exist
            if (product.variations && product.variations.length > 0) {
                payload.variation = JSON.stringify(selectedOptions);
            }

            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`);
            } else {
                toast.error(data.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('An error occurred while adding to cart');
        } finally {
            setAdding(false);
        }
    };

    const renderQuantitySelector = () => {
        return (
            <div className="mt-4 flex items-center">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-l-lg"
                >
                    -
                </button>
                <input
                    type="number"
                    value={quantity}
                    min="1"
                    max={availableStock}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setQuantity(
                            isNaN(val) ? 1 :
                                val > availableStock ? availableStock :
                                    val < 1 ? 1 : val
                        );
                    }}
                    className="w-16 text-center border dark:border-gray-600 dark:bg-gray-800"
                />
                <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-r-lg"
                >
                    +
                </button>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {availableStock} available
                </span>
            </div>
        );
    };


    const handleOptionChange = (variationName: string, option: string) => {
        const newOptions = { ...selectedOptions, [variationName]: option };
        setSelectedOptions(newOptions);
        updateAvailableStock(newOptions);
    };

    if (!product) {
        return <div>Product not found.</div>;
    }

    const { name, price, id, description, variations, images } = product;


    return (
        <>

            <div className="mt-6 sm:mt-8 lg:mt-0">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    {name}
                </h1>
                <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                    <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                        {`Ksh. ${price}`}
                    </p>
                </div>

                {/* Variants Section */}
                {variations && variations.length > 0 && (
                    <div className="mt-4">
                        {variations.map((variation: any) => (
                            <div key={variation.name} className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{variation.name}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {variation.options.map((option: string) => (
                                        <button
                                            key={option}
                                            onClick={() => handleOptionChange(variation.name, option)}
                                            className={`
                                p-2 rounded-lg border 
                                hover:bg-gray-100 dark:hover:bg-gray-700
                                ${selectedOptions[variation.name] === option ? 'ring-2 ring-primary-600' : 'bg-white dark:bg-gray-900'}
                              `}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {renderQuantitySelector()}

                <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                    <button
                        onClick={() => handleWishlistToggle(id)}
                        className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        {loadingWishlist[id]
                            ? 'Adding...'
                            : wishlist[id]
                                ? 'Remove from Wishlist'
                                : 'Add to Wishlist'}
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={availableStock === 0 || Adding}
                        className={`text-white mt-4 sm:mt-0 
                ${availableStock > 0 && !Adding
                                ? 'bg-primary-700 hover:bg-primary-800'
                                : 'bg-gray-400 cursor-not-allowed'}
                focus:ring-4 focus:ring-primary-300 font-medium rounded-lg 
                text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 
                focus:outline-none dark:focus:ring-primary-800 flex items-center justify-center
            `}
                    >
                        {availableStock === 0
                            ? 'Out of Stock'
                            : Adding
                                ? 'Adding...'
                                : `Add ${quantity} to Tickets`}
                    </button>
                </div>

                            <hr className="my-6 md:my-8 border-gray-200 dark:border-gray-800" />

                            <p className="mb-6 text-gray-500 dark:text-gray-400">
                                {description}
                            </p>

            </div>
        </>
    );
};

export default ProductInfoClient;
