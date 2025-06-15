'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    image: string;
    slug: string;
}

interface CategoryListProps {
    categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
    const router = useRouter();

    const handleCategoryClick = (categorySlug: string) => {
        const queryParams = new URLSearchParams();
        if (categorySlug !== "all") queryParams.set('category', categorySlug);
        else queryParams.delete('category');

        const baseUrl = '/';
        const newUrl = queryParams.toString() ? `${baseUrl}shop?${queryParams.toString()}` : baseUrl;
        router.push(newUrl, { scroll: false });
    };

    return (
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl mb-4">Engagements</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="group relative block overflow-hidden rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-lg">
                            <Image
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                width={200} 
                                height={200} 
                            />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
