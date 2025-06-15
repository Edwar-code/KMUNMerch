'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

// Order interface
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

const OrderSuccess = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        console.log("Order data:", data);

        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(`Failed to load order details: ${err.message || 'Unknown error'}`);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [session, sessionStatus, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading order details...
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

  return (
    <section className="container py-8 antialiased">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-6 w-6" />
            Order Successful!
          </CardTitle>
          <CardDescription>Thank you for your order.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium leading-none">Order Number</p>
              <p className="text-gray-500">{order.payheroReference}</p>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Order Date</p>
              <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium leading-none">Shipping Address</p>
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Return to Shopping</Link>
          </Button>
          <Button>
            <Link href={`/order?orderId=${order.id}`}>Track Order</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

export default OrderSuccess;