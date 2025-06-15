'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';

// Define a type for the order
type Order = {
    id: string;
    total: number;
    paymentStatus: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

const OrderPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/orders');
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatuses(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const filteredOrders = orders.filter(order => {
        const searchMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(order.status);
        return searchMatch && statusMatch;
    });

    const orderStatusColors = {
        'processing': 'bg-yellow-100 text-yellow-800',
        'shipped': 'bg-blue-100 text-blue-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'pending': 'bg-gray-100 text-gray-800'
    };

    const confirmDeleteOrder = (orderId: string) => {
        setDeleteOrderId(orderId);
        setOpen(true);
    };

    const handleDeleteOrderConfirmed = async () => {
        setOpen(false);
        try {
            if (!deleteOrderId) {
                console.error('No order ID to delete.');
                return;
            }

            const response = await fetch(`/api/orders?id=${deleteOrderId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setOrders(prevOrders => 
                    prevOrders.filter(order => order.id !== deleteOrderId)
                );
                toast.success('Order deleted successfully!');
            } else {
                console.error('Failed to delete order');
                toast.error('Failed to delete order.');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Error deleting order.');
        } finally {
            setDeleteOrderId(null);
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                        <div className="w-full md:w-1/2 relative">
                            <Input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                        </div>
                        
                        <div className="relative">
                            <Button 
                                onClick={() => setFilterOpen(!filterOpen)}
                                variant="outline"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            
                            {filterOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg dark:bg-gray-700 z-20"
                                >
                                    <div className="p-3">
                                        <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                                            Order Status
                                        </h6>
                                        <div className="space-y-2">
                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                                 <div key={status} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={status}
                                                        checked={selectedStatuses.includes(status)}
                                                        onCheckedChange={() => handleStatusChange(status)}
                                                    />
                                                     <Label htmlFor={status} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                                      </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {loading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 shadow-sm p-4 animate-pulse">
                                    <div className="flex justify-between items-start">
                                        <div className="w-3/4">
                                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <AnimatePresence>
                                    {filteredOrders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 shadow-sm p-4 relative"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Order #{order.id.slice(-6)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Total: Ksh. {order.total}
                                                    </p>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/orders/show/${order.id}`} className="flex items-center">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                Show
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/orders/edit/${order.id}`} className="flex items-center">
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => confirmDeleteOrder(order.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Payment Status</span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            order.paymentStatus === "paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {order.paymentStatus}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Order Status</span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            orderStatusColors[order.status as keyof typeof orderStatusColors] ||
                                                            "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {filteredOrders.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        No Orders found
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing 
                            <span className="font-semibold text-gray-900 dark:text-white mx-1">1-10</span>
                            of 
                            <span className="font-semibold text-gray-900 dark:text-white mx-1">1000</span>
                        </span>
                        
                        <div className="inline-flex space-x-2">
                            <Button variant="ghost" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </Button>
                            <Button variant="ghost" className="p-2 rounded-lg bg-primary-50 text-primary-600 dark:bg-gray-700">
                                1
                            </Button>
                            <Button variant="ghost" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                2
                            </Button>
                            <Button variant="ghost" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                3
                            </Button>
                            <Button variant="ghost" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteOrderConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default OrderPage;