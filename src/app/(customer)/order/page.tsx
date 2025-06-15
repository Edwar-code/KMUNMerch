'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, PackageCheck, Home, Truck, ShoppingBag, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
    id: string;
    userId: string;
    items: {
        id: string;
        productId: string;
        quantity: number;
        variation: string | null;
    }[];
    total: number;
    countryId: string | null;
    countyId: string | null;
    cityId: string | null;
    street: string | null;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionId: string | null;
    payheroReference: string;
    createdAt: Date;
    updatedAt: Date;
    country?: { name: string };
    county?: { name: string };
    city?: { name: string };
}

interface Product {
    id: string;
    name: string;
}

interface TrackingEvent {
    date: Date;
    status: string;
    description: string;
    icon: React.ReactNode;
    completed: boolean;
}

const OrderDetails = () => {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [productNames, setProductNames] = useState<{ [productId: string]: string }>({});
    const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

    useEffect(() => {
        if (sessionStatus === 'loading') {
            return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            setError('Invalid order ID.');
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            setError(null);

            if (!session) {
                setError('You must be logged in to view this order.');
                router.push('/login');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/orders?id=${orderId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch order: ${response.status} - ${response.statusText}`);
                }

                const data: Order = await response.json();
                console.log("Order data:", data); // Debugging: Inspect the fetched order data

                setOrder(data);
                // Fetch product names after fetching the order
                fetchProductNames(data);
                // Generate tracking events based on the order creation date
                generateTrackingEvents(data);

            } catch (err: any) {
                console.error('Error fetching order:', err);
                setError(`Failed to load order details: ${err.message || 'Unknown error'}`);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchProductNames = async (order: Order) => {
            const productIds = order.items.map((item) => item.productId);
            const uniqueProductIds = [...new Set(productIds)]; 

            const names: { [productId: string]: string } = {};

            for (const productId of uniqueProductIds) {
                try {
                    const response = await fetch(`/api/products?id=${productId}`);
                    if (response.ok) {
                        const product: Product = await response.json();
                        names[productId] = product.name;
                    } else {
                        console.error(`Failed to fetch product name for ID ${productId}`);
                        names[productId] = 'Product Name Not Found'; 
                    }
                } catch (error) {
                    console.error(`Error fetching product name for ID ${productId}:`, error);
                    names[productId] = 'Product Name Not Found'; 
                }
            }
            setProductNames(names);
        };


        fetchOrder();
    }, [session, sessionStatus, router]);

  const generateTrackingEvents = (order: Order) => {
    const currentDate = new Date();
    const orderDate = new Date(order.createdAt);

    // Set processing and shipping dates based on new logic
    const processingStartDate = new Date(orderDate);
    processingStartDate.setMinutes(orderDate.getMinutes() + 2); // Processing starts after 2 minutes

    const processingEndDate = new Date(orderDate);
    processingEndDate.setMinutes(orderDate.getMinutes() + 4.5); // Processing ends after 4.5 minutes

    const shippingDate = new Date(orderDate);
    shippingDate.setMinutes(orderDate.getMinutes() + 7); // Shipping starts after 7 minutes

    const estimatedDeliveryDate = new Date(orderDate);
    estimatedDeliveryDate.setMinutes(orderDate.getMinutes() + 10); // Delivery within 10 minutes

    // Determine the current status based on the order's status field and dates
    const currentStatus = determineCurrentStatus(order.status, currentDate, estimatedDeliveryDate, order.createdAt);

    // Create the tracking events
    const events: TrackingEvent[] = [
        {
            date: orderDate,
            status: 'Ticket Ordered',
            description: `Order placed - Ticket #${order.payheroReference}`,
            icon: <ShoppingBag className="h-4 w-4" />,
            completed: true // Order placed is always completed
        },
        {
            date: processingStartDate,
            status: 'Processing Slots Available',
            description: 'Ticket is being issued',
            icon: <Loader2 className="h-4 w-4" />,
            completed: currentStatus === 'PROCESSING' || currentStatus === 'SHIPPED' || currentStatus === 'DELIVERED'
        },
        {
            date: processingEndDate,
            status: 'Processed',
            description: 'Slot Confirmed',
            icon: <Truck className="h-4 w-4" />,
            completed: currentStatus === 'SHIPPED' || currentStatus === 'DELIVERED'
        },
        {
            date: shippingDate,
            status: 'Ticket Issued',
            description: 'Thank you for attending the event!',
            icon: <CheckCircle className="h-4 w-4" />,
            completed: currentStatus === 'DELIVERED'
        }
    ];

    setTrackingEvents(events);
};    
    const determineCurrentStatus = (orderStatus: OrderStatus, currentDate: Date, estimatedDeliveryDate: Date, orderCreatedAt: Date): string => {
        // If the order status is explicitly set in the database, use that
        if (orderStatus === 'delivered') {
            return 'DELIVERED';
        }
        
        if (orderStatus === 'shipped') {
            return 'SHIPPED';
        }
        
        if (orderStatus === 'processing') {
            return 'PROCESSING';
        }
        
        // Otherwise, make a best guess based on the dates
        if (currentDate >= estimatedDeliveryDate) {
            return 'DELIVERED';
        }
        
        const orderDate = new Date(orderCreatedAt || 0);
        const nextDay = new Date(orderDate);
        nextDay.setDate(orderDate.getDate() + 1);
        
        if (currentDate >= nextDay) {
            return 'SHIPPED';
        }
        
        return 'PROCESSING';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Ticket order details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-screen">
                <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                <p className="text-center text-gray-500">Order not found.</p>
            </div>
        );
    }

    const getTrackingProgress = (): number => {
        const completedEvents = trackingEvents.filter(event => event.completed).length;
        return Math.round((completedEvents / trackingEvents.length) * 100);
    };

    return (
        <section className="container py-8 antialiased">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PackageCheck className="text-blue-500 h-6 w-6" />
                       Ticket Order Details
                    </CardTitle>
                    <CardDescription>Here are the details of your order.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="tracking">Tracking</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium leading-none">Ticket Number</p>
                                    <p className="text-gray-500">{order.payheroReference}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">Order Date</p>
                                    <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium leading-none"> Address</p>
                                    <p className="text-gray-500">
                                        {order.street && `${order.street}, `}
                                        {order.city?.name && `${order.city.name}, `}
                                        {order.county?.name && `${order.county.name}, `}
                                        {order.country?.name && order.country.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">Payment Status</p>
                                    <p className="text-gray-500">{order.paymentStatus}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium leading-none">Order Status</p>
                                    <p className="text-gray-500">{order.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">Total Amount</p>
                                    <p className="text-gray-500">{`Ksh.${order.total.toFixed(2)}`}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Ticket</p>
                                <ul className="list-none pl-0">
                                    {order.items.map((item) => (
                                        <li key={item.id} className="py-2 border-b border-gray-200 last:border-b-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-semibold">{productNames[item.productId] || 'Loading...'}</span>
                                                    {item.variation && <span className="text-gray-500"> - {item.variation}</span>}
                                                </div>
                                                <div className="text-gray-700">
                                                    Quantity: {item.quantity}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>
                        <TabsContent value="tracking">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                                    Track proccessing of your ticket #{order.payheroReference}
                                </h2>
                                
                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2.5 my-6">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{width: `${getTrackingProgress()}%`}}></div>
                                </div>
                                
                                {/* Estimated delivery date */}
                                {trackingEvents.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Estimated Slot Confirmation </p>
                                        <p className="text-lg font-semibold">{trackingEvents[1].date.toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</p>
                                    </div>
                                )}
                                
                                <ol className="relative ms-3 border-s border-gray-200 dark:border-gray-700 mt-4">
                                    {trackingEvents.map((event, index) => (
                                        <li key={index} className="mb-10 ms-6">
                                            <span className={`absolute -start-3.5 flex h-7 w-7 items-center justify-center rounded-full ${
                                                event.completed 
                                                    ? "bg-green-100 text-green-500 ring-8 ring-white dark:bg-green-900 dark:ring-gray-900"
                                                    : "bg-gray-200 ring-8 ring-white dark:bg-gray-900 dark:ring-gray-900"
                                            }`}>
                                                {event.icon}
                                            </span>
                                            <div className="block py-2 ps-4">
                                                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                    {event.date.toLocaleDateString()} 
                                                    {" - "}
                                                    {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <h4 className={`text-base font-semibold ${
                                                    event.completed ? "text-green-500" : "text-gray-900 dark:text-white"
                                                }`}>
                                                    {event.status}
                                                </h4>
                                                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">{event.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/">Return to Events</Link>
                    </Button>
                </CardFooter>
            </Card>
        </section>
    );
};

export default OrderDetails;
