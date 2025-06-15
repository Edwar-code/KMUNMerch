'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input"

interface Category {
    id: string;
    name: string;
    image: string;
    slug: string;
}

interface FiltersProps {
    categories: Category[];
    initialCategory: string;
    initialSortBy: 'price' | 'createdAt' | 'name';
    initialOrder: 'asc' | 'desc';
    initialMinPrice: number | undefined;
    initialMaxPrice: number | undefined;
}

export const Filters: React.FC<FiltersProps> = ({ categories, initialCategory, initialSortBy, initialOrder, initialMinPrice, initialMaxPrice }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
    const [sortBy, setSortBy] = useState<'price' | 'createdAt' | 'name'>(initialSortBy);
    const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder);
    const [isFiltered, setIsFiltered] = useState(false); // Track if any filters are applied

    useEffect(() => {
        setIsFiltered(!!selectedCategorySlug || minPrice !== undefined || maxPrice !== undefined);
    }, [selectedCategorySlug, minPrice, maxPrice]);

    const handleCategoryChange = (categorySlug: string) => {
        setSelectedCategorySlug(categorySlug === "all" ? "" : categorySlug);
        updateUrl({ category: categorySlug === "all" ? undefined : categorySlug });
    };

    const handleSortByChange = (value: 'price' | 'createdAt' | 'name') => {
        setSortBy(value);
        updateUrl({ sortBy: value });
    };

    const handleOrderChange = (value: 'asc' | 'desc') => {
        setOrder(value);
        updateUrl({ order: value });
    };

    const handlePriceFilterChange = () => {
        updateUrl({
            minPrice: minPrice !== undefined ? minPrice.toString() : undefined,
            maxPrice: maxPrice !== undefined ? maxPrice.toString() : undefined,
        });
    };

    const updateUrl = (params: { [key: string]: string | undefined }) => {
        const newParams = new URLSearchParams(searchParams);
        for (const key in params) {
            if (params[key] === undefined) {
                newParams.delete(key);
            } else {
                newParams.set(key, params[key]!);
            }
        }
        router.push(`/?${newParams.toString()}`);
    };

    return (
        <div className="mb-4 flex items-center space-x-4">
            <Dialog>
                <DialogTrigger className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                    Filters
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Filter Events</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="category">Category</label>
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
                            <label htmlFor="minPrice">Min Price</label>
                            <Input
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
                            <label htmlFor="maxPrice">Max Price</label>
                            <Input
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
                            className="inline-flex items-center rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
                Sort
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
);
};