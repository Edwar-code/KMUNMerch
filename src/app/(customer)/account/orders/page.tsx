'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link';

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  payheroReference: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
};

const AccountOrdersPage = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<string>('All orders');
  const [duration, setDuration] = useState<string>('this week');

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === 'loading') return;
      if (status !== 'authenticated') {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders?userId=${session?.user?.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user?.id, status]);

  const handleCancelOrder = async (orderId: string) => {
    // Implement the logic to cancel the order
    console.log(`Cancel order with ID: ${orderId}`);
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700"></TableCell>
      <TableCell className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700"></TableCell>
      <TableCell className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700"></TableCell>
      <TableCell className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700"></TableCell>
      <TableCell className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700"></TableCell>
    </TableRow>
  );

  const SkeletonTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Order Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </TableBody>
    </Table>
  );


  if (loading) return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-700 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"></h2>

            <div className="mt-6 gap-4 space-y-4 sm:mt-0 sm:flex sm:items-center sm:justify-end sm:space-y-0">
              <div className="animate-pulse h-10 w-32 bg-gray-200 dark:bg-gray-700">

              </div>

              <span className="inline-block text-gray-500 dark:text-gray-400"> from </span>

              <div className="animate-pulse h-10 w-32 bg-gray-200 dark:bg-gray-700">

              </div>
            </div>
          </div>

          <div className="mt-6 flow-root sm:mt-8">
            <SkeletonTable />
          </div>


        </div>
      </div>
    </section>
  );
  if (error) return <div>Error: {error}</div>;

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">My orders</h2>

            <div className="mt-6 gap-4 space-y-4 sm:mt-0 sm:flex sm:items-center sm:justify-end sm:space-y-0">
              <div>
                <label htmlFor="order-type" className="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white">Select order type</label>
                <Select onValueChange={setOrderType}>
                  <SelectTrigger className="w-full min-w-[8rem]">
                    <SelectValue placeholder="All orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All orders">All orders</SelectItem>
                    <SelectItem value="pre-order">Pre-order</SelectItem>
                    <SelectItem value="transit">In transit</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="inline-block text-gray-500 dark:text-gray-400"> from </span>

              <div>
                <label htmlFor="duration" className="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white">Select duration</label>
                <Select onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="this week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this week">this week</SelectItem>
                    <SelectItem value="this month">this month</SelectItem>
                    <SelectItem value="last 3 months">the last 3 months</SelectItem>
                    <SelectItem value="last 6 months">the last 6 months</SelectItem>
                    <SelectItem value="this year">this year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 flow-root sm:mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium"><Link href="#" className="hover:underline">{`#${order.payheroReference}`}</Link></TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{`Ksh. ${order.total}`}</TableCell>
                    <TableCell>
                      {order.status === 'pending' && (
                        <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending
                        </span>
                      )}
                      {order.status === 'processing' && (
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Processing
                        </span>
                      )}
                      {order.status === 'shipped' && (
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Shipped
                        </span>
                      )}
                      {order.status === 'delivered' && (
                        <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Delivered
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          Cancelled
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order.id)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Link href={`/order?orderId=${order.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountOrdersPage;