'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronDown,
    Folder,
    FolderOpen
} from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner';

type Category = {
    id: string;
    slug: string;
    name: string;
    description?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
};

const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setloading] = useState(true);
    const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setloading(true)
                const response = await fetch('/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setloading(false);
            }
        };

        fetchCategories();
    }, []);

    const confirmDeleteCategory = (categoryId: string) => {
        setDeleteCategoryId(categoryId);
        setOpen(true);
    };

    const handleDeleteCategoryConfirmed = async () => {
        setOpen(false);
        try {
            if (!deleteCategoryId) {
                console.error('No category ID to delete.');
                return;
            }

            const response = await fetch(`/api/categories?id=${deleteCategoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCategories(prevCategories =>
                    prevCategories.filter(category => category.id !== deleteCategoryId)
                );
                toast.success('Category deleted successfully!');
            } else {
                console.error('Failed to delete category');
                toast.error('Failed to delete category.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Error deleting category.');
        } finally {
            setDeleteCategoryId(null);
        }
    };

    const toggleCategoryExpand = (slug: string) => {
        setExpandedCategory(prev => prev === slug ? null : slug);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-8 sm:ml-36">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-1/2">
                        <form className="flex items-center">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    id="simple-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Search categories"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <Button onClick={() => window.location.href = '/categories/new'} variant="default">
                            <Plus className="h-3.5 w-3.5 mr-2" />
                            Add Category
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3].map((btn) => (
                                                <div
                                                    key={btn}
                                                    className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            delayChildren: 0.2,
                                            staggerChildren: 0.1,
                                        },
                                    },
                                }}
                            >
                                {filteredCategories.map((category) => (
                                    <motion.div
                                        key={category.slug}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    {expandedCategory === category.slug ? (
                                                        <FolderOpen className="mr-3 text-primary-600" />
                                                    ) : (
                                                        <Folder className="mr-3 text-gray-500" />
                                                    )}
                                                    {category.name}
                                                </h2>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/categories/edit/${category.slug}`}
                                                        className="text-gray-500 hover:text-primary-600 transition"
                                                    >
                                                        <Edit2 size={20} />
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => confirmDeleteCategory(category.id)}
                                                        className="text-red-500 hover:text-red-700 transition p-0 h-auto w-auto"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleCategoryExpand(category.slug)}
                                                        className="text-gray-500 hover:text-primary-600 transition p-0 h-auto w-auto"
                                                    >
                                                        <ChevronDown
                                                            size={20}
                                                            className={`transform transition-transform ${expandedCategory === category.slug ? 'rotate-180' : ''}`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedCategory === category.slug && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t pt-4 mt-4 dark:border-gray-700">
                                                            <h3 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                                Description
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {category.description || "No Description provided."}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        {filteredCategories.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No Categories found
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteCategoryConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CategoryPage;