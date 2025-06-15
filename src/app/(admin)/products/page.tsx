'use client'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"

// Define types
type Category = {
    id: string;
    name: string;
    slug: string;
};

type Product = {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discount: number;
    categoryId: string;
    category: Category;
    variations: any[]; 
    images: string[];
    stock: number;
    createdAt: Date;
    updatedAt: Date;
};

const ProductsPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default to ascending
    const [sortBy, setSortBy] = useState<'price' | 'createdAt' | 'name'>('createdAt'); // Default sort by created at

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

     // Delete All confirmation dialog
     const [deleteAllOpen, setDeleteAllOpen] = useState(false);

    const createQueryString = useCallback(
        (name: string, value: string) => {
          const params = new URLSearchParams(searchParams)
          params.set(name, value)
     
          return params.toString()
        },
        [searchParams]
      )

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/products?page=${page}&limit=${limit}&name=${searchTerm}&categoryId=${selectedCategory || ''}&sortBy=${sortBy}&order=${sortOrder}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data.products);
                setTotalCount(data.totalCount);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [page, limit, searchTerm, selectedCategory, sortBy, sortOrder]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to the first page when changing the limit
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success("Product deleted successfully");
                // Refresh the product list or update state as needed
                setProducts(products.filter(product => product.id !== id));
            } else {
                toast.error("Failed to delete product");
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const confirmDeleteAll = () => {
        setDeleteAllOpen(true);
    };

    const handleDeleteAllConfirmed = async () => {
        setDeleteAllOpen(false); // Close the dialog

        try {
            // Collect all product IDs
            const productIds = products.map(product => product.id);
    
            // Delete each product individually
            for (const productId of productIds) {
                const response = await fetch(`/api/products?id=${productId}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    console.error(`Failed to delete product with ID: ${productId}`);
                    continue; // Continue to the next product if one fails
                }
            }
    
            toast.success("All products deleted successfully");
            setProducts([]);
            setTotalCount(0);
        } catch (error) {
            console.error('Error deleting products:', error);
            toast.error("Failed to delete products");
        }
    };
    

    // Handle Category Filtering
    const handleCategoryFilter = (categoryId: string) => {
        setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    };

    const handleSortOrderChange = (newSortBy: 'price' | 'createdAt' | 'name') => {
        if (sortBy === newSortBy) {
            // If the same sort option is selected, toggle the order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // If a different sort option is selected, set the new sort option and default to ascending order
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                        <div className="w-full md:w-1/2">
                            <form className="flex items-center">
                                <label htmlFor="simple-search" className="sr-only">Search</label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="simple-search"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPage(1); // Reset to the first page when searching
                                        }}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder="Search products"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <button type="button" onClick={() => window.location.href = '/products/new'} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
                                </svg>
                                Add product
                            </button>
                            <div className="flex items-center space-x-3 w-full md:w-auto">
                                <Select onValueChange={(value) => {
                                    if (value === 'delete-all') {
                                        confirmDeleteAll();
                                    }
                                }}>
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="Actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="delete-all">Delete all</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select 
                                    value={selectedCategory || 'all'}
                                    onValueChange={(value) => {
                                        handleCategoryFilter(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {Array.from(new Set(products.map(product => product.category)))
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select 
                                    value={`${sortBy}-${sortOrder}`}
                                    onValueChange={(value) => {
                                        const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Name</SelectLabel>
                                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Price</SelectLabel>
                                            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                                            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Date</SelectLabel>
                                            <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
                                            <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                        <div className="w-full md:w-1/3">
                           <Label htmlFor="limit">Items per page:</Label>
                            <Select value={limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select items per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {isLoading ? (
                        Array.from({ length: limit }).map((_, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 dark:text-white relative animate-pulse">
                                <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-4 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="w-1/3 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="w-1/3 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.id} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 dark:text-white relative">
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {product.description.length > 128
                                            ? `${product.description.substring(0, 128)}...`
                                            : product.description}
                                    </p>
                                    <p className="font-semibold text-primary-700 mt-2">
                                        {`Ksh. ${product.price}`}
                                    </p>
                                    <div className="flex justify-between items-center mt-4">
                                        <Link
                                            href={`/products/edit/${product.slug}`}
                                            className="text-sm text-blue-500 hover:text-blue-700"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="text-sm text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400">
                                No products found
                            </div>
                        )
                    )}
                </div>
                {/* Pagination */}
                <div className="flex justify-center mt-6">
                    <div className="inline-flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="py-2 px-4 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page {page} of {Math.ceil(totalCount / limit)}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page * limit >= totalCount}
                            className="py-2 px-4 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete All Confirmation Dialog */}
            <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete All Products</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all products? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setDeleteAllOpen(false)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-muted-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAllConfirmed}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                        >
                            Delete All
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

export default ProductsPage;