import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next/types';
import ProductJsonLd from '@/components/ProductJsonLd';
import ProductInfoClient from '@/components/ProductInfoClient';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

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

interface Props {
    params: Promise<{ slug: string }>;
}

interface ProductResponse {
    products: Product[];
}

async function getProduct(slug: string): Promise<ProductResponse> {
    const apiUrl = `${process.env.WEBSITE_URL}/api/products?slug=${slug}`;
    console.log("Fetching from:", apiUrl);

    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to fetch product. Status: ${res.status}`);
    }
    return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    try {
        const { products } = await getProduct(slug);
        const product = products[0];

        if (!product) {
            return {
                title: 'Product Not Found | KeMUN Connect',
            };
        }

        const productTitle = product.name
            ? `${product.name} | KeMUN Connect`
            : 'Product Details | KeMUN Connect';

        const productDescription = product.description
            ? `${product.description.substring(0, 150)}...`
            : 'Explore unique items and content from KeMUN Connect. Discover this product and more!';

        return {
            title: productTitle,
            description: productDescription,
            openGraph: {
                type: 'website',
                url: `${process.env.WEBSITE_URL}/${slug}`,
                title: productTitle,
                description: productDescription,
                images: product.images?.length ? [product.images[0]] : [],
                siteName: 'KeMUN Connect',
            },
            twitter: {
                card: 'summary_large_image',
                title: productTitle,
                description: productDescription,
                images: product.images?.length ? [product.images[0]] : [],
            },
            metadataBase: new URL(process.env.WEBSITE_URL as string),
            alternates: {
                canonical: `/${slug}`,
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: 'Error | KeMUN Connect',
            description: 'An error occurred while generating metadata.',
        };
    }
}

const Productinfo = async ({ params }: Props) => {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    try {
        const { products } = await getProduct(slug);
        const product = products[0];

        if (!product) {
            return <div className="text-center py-10 text-red-500">Product not found.</div>;
        }

        return (
            <>
                <ProductJsonLd
                    name={product.name}
                    images={product.images}
                    description={product.description}
                    id={product.id}
                    price={product.price}
                    slug={slug}
                    availableStock={product.stock}
                />

                <section className="py-8 bg-white md:py-16 dark:bg-gray-900 antialiased">
                    <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
                            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
                                {product.images.length > 0 ? (
                                    <Carousel className="w-full max-w-md">
                                        <CarouselContent>
                                            {product.images.map((image, index) => (
                                                <CarouselItem key={index} className="pl-1">
                                                    <div className="p-1">
                                                        <Image
                                                            src={image}
                                                            alt={`${product.name} - Product image ${index + 1}`}
                                                            className="rounded-md object-cover"
                                                            width={430}
                                                            height={224}
                                                            style={{ objectFit: 'cover' }}
                                                            priority={index < 2}
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-2" />
                                        <CarouselNext className="right-2" />
                                    </Carousel>
                                ) : (
                                    <p>No images available for this product.</p>
                                )}
                            </div>

                            {/* Product info client component */}
                            <ProductInfoClient product={product} availableStockProps={product.stock} />
                        </div>
                    </div>
                </section>
            </>
        );
    } catch (error) {
        console.error("Error fetching product:", error);
        return (
            <div className="text-center py-10 text-red-500">
                Error loading product. Please try again later.
            </div>
        );
    }
};

export default Productinfo;
