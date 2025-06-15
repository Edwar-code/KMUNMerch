'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Percent,
    Trash2,
    Edit2,
    Search,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner';

type Coupon = {
    id: string;
    code: string;
    discount: number;
    validFrom: Date;
    validUntil: Date;
    maxUses: number | null;
    createdAt: Date;
};

const CouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true);
    const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                setLoading(true);
                let url = '/api/coupons';
                if (searchTerm) url += `?code=${searchTerm}`;

                const response = await fetch(url);
                const data = await response.json();
                setCoupons(data);
            } catch (error) {
                console.error('Error fetching coupons:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCoupons()
    }, [searchTerm])

    const handleDeleteCoupon = async (id: string) => {
        try {
            const response = await fetch(`/api/coupons?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== id))
                toast.success("Successfully deleted coupon!")
            } else {
                toast.error("Failed to delete coupon!")
                console.error('Failed to delete coupon')
            }
        } catch (error) {
            toast.error("Error deleting coupon!")
            console.error('Error deleting coupon:', error)
        }
    }

    const confirmDeleteCoupon = (couponId: string) => {
        setDeleteCouponId(couponId);
        setOpen(true);
    };

    const handleDeleteCouponConfirmed = async () => {
        setOpen(false);
        try {
            if (!deleteCouponId) {
                console.error('No coupon ID to delete.');
                return;
            }

            const response = await fetch(`/api/coupons?id=${deleteCouponId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCoupons(prevCoupons => 
                    prevCoupons.filter(coupon => coupon.id !== deleteCouponId)
                );
                toast.success('Coupon deleted successfully!');
            } else {
                console.error('Failed to delete coupon');
                toast.error('Failed to delete coupon.');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Error deleting coupon.');
        } finally {
            setDeleteCouponId(null);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
            <div className="container mx-auto sm:ml-36 p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-1/2">
                        <form className="flex items-center">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <Input 
                                    type="text" 
                                    id="simple-search" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Search coupons" 
                                />
                            </div>
                        </form>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <Button type="button" onClick={() => router.push('/coupons/new')} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-800">
                            <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
                            </svg>
                            Add Coupon
                        </Button>
                    </div>
                </div>

                {/* Content Section */}
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
                                {coupons.map((coupon) => (
                                    <motion.div
                                        key={coupon.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    <Percent className="mr-3 text-gray-500" />
                                                    {coupon.code}
                                                </h2>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/coupons/edit/${coupon.id}`}
                                                        className="text-gray-500 hover:text-primary-600 transition"
                                                    >
                                                        <Edit2 size={20} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => confirmDeleteCoupon(coupon.id)}
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                              
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t pt-4 mt-4 dark:border-gray-700">
                                                        <h3 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                            Information
                                                        </h3>
                                                          <p className="text-sm text-gray-400 italic">
                                                          Discount: {coupon.discount}
                                                        </p>
                                                          <p className="text-sm text-gray-400 italic">
                                                          Valid From: {new Date(coupon.validFrom).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-sm text-gray-400 italic">
                                                          Valid Until: {new Date(coupon.validUntil).toLocaleDateString()}
                                                        </p>
                                                           <p className="text-sm text-gray-400 italic">
                                                          Max Uses: {coupon.maxUses}
                                                        </p>
                                                        </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        {coupons.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No coupons found.
                            </div>
                        )}
                    </>
                )}
            </div>
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Coupon</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this coupon? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteCouponConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CouponsPage