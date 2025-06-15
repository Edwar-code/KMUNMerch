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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";

// Define types
type Hero = {
    id: string;
    title: string;
    subtitle: string | null;
    image: string;
    link: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const HerosPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [heros, setHeros] = useState<Hero[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);

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
        const fetchHeros = async () => {
            setIsLoading(true);
            try {
                let url = `/api/heros?sortBy=${sortBy}&order=${sortOrder}`;
                if (isActiveFilter !== null) {
                    url += `&isActive=${isActiveFilter}`;
                }

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHeros(data);
            } catch (error) {
                console.error("Failed to fetch heros:", error);
                toast.error("Failed to fetch heros");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeros();
    }, [sortBy, sortOrder, isActiveFilter]);


    const handleDeleteHero = async (id: string) => {
        try {
            const response = await fetch(`/api/heros?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success("Hero deleted successfully");
                setHeros(heros.filter(hero => hero.id !== id));
            } else {
                toast.error("Failed to delete hero");
                console.error('Failed to delete hero');
            }
        } catch (error) {
            console.error('Error deleting hero:', error);
        }
    };

    const confirmDeleteAll = () => {
        setDeleteAllOpen(true);
    };

    const handleDeleteAllConfirmed = async () => {
        setDeleteAllOpen(false);

        try {
            const heroIds = heros.map(hero => hero.id);

            for (const heroId of heroIds) {
                const response = await fetch(`/api/heros?id=${heroId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    console.error(`Failed to delete hero with ID: ${heroId}`);
                    continue;
                }
            }

            toast.success("All heros deleted successfully");
            setHeros([]);
        } catch (error) {
            console.error('Error deleting heros:', error);
            toast.error("Failed to delete heros");
        }
    };

    const handleSortOrderChange = (newSortBy: 'createdAt' | 'updatedAt') => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const handleIsActiveFilterChange = (value: 'true' | 'false' | 'all') => {
        if (value === 'all') {
            setIsActiveFilter(null);
        } else {
            setIsActiveFilter(value === 'true');
        }
    };

    const handleIsActiveChange = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/heros?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (response.ok) {
                toast.success(`Hero ${isActive ? 'deactivated' : 'activated'} successfully`);
                setHeros(heros.map(hero =>
                    hero.id === id ? { ...hero, isActive: !isActive } : hero
                ));
            } else {
                toast.error("Failed to update hero status");
                console.error('Failed to update hero status');
            }
        } catch (error) {
            console.error('Error updating hero status:', error);
            toast.error("Error updating hero status");
        }
    };


    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">

                        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <button type="button" onClick={() => window.location.href = '/heros/new'} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
                                </svg>
                                Add Hero
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
                                    onValueChange={(value) => {
                                        handleIsActiveFilterChange(value as 'true' | 'false' | 'all');
                                    }}
                                    defaultValue="all"
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filter by Active" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>


                                <Select
                                    value={`${sortBy}-${sortOrder}`}
                                    onValueChange={(value) => {
                                        const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Date</SelectLabel>
                                            <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
                                            <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
                                            <SelectItem value="updatedAt-asc">Updated At (Oldest)</SelectItem>
                                            <SelectItem value="updatedAt-desc">Updated At (Newest)</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 dark:text-white relative animate-pulse">
                                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-4 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="w-1/3 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="w-1/3 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        heros.length > 0 ? (
                            heros.map((hero) => (
                                <div key={hero.id} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 dark:text-white relative">
                                    <img src={hero.image} alt={hero.title} className="h-48 w-full object-cover rounded mb-4" />
                                    <h3 className="text-lg font-semibold">{hero.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {hero.subtitle}
                                    </p>
                                    <div className="flex justify-between items-center mt-4">
                                        <Link
                                            href={`/heros/edit/${hero.id}`}
                                            className="text-sm text-blue-500 hover:text-blue-700"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteHero(hero.id)}
                                            className="text-sm text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor={`hero-active-${hero.id}`} className="text-sm">
                                                Active
                                            </Label>
                                            <Switch
                                                id={`hero-active-${hero.id}`}
                                                checked={hero.isActive}
                                                onCheckedChange={() => handleIsActiveChange(hero.id, hero.isActive)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400">
                                No heros found
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Delete All Confirmation Dialog */}
            <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete All Heros</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all heros? This action cannot be undone.
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

export default HerosPage;