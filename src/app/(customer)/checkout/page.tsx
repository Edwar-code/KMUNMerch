
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";

// Extended interfaces
interface Address {
  street: string;
  cityId: string | null;
  countyId: string | null;
  countryId: string | null;
}

interface CartPricing {
  subtotal: number;
  formattedSubtotal: string;
  vat: number;
  formattedVAT: string;
  total: number;
  formattedTotal: string;
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
  variation: string | null;
}

interface CartData {
  items: CartItem[];
  totalItems: number;
  pricing?: CartPricing; // Keep if used, otherwise optional
}

interface UserData {
  id: string;
  name: string;
  email: string;
  number: string; // Ensure this is a string if formatting depends on it
  countryId: string | null;
  countyId: string | null;
  cityId: string | null;
  street: string | null;
}

interface PaymentStatus {
  status:
    | "idle"
    | "loading_data"
    | "preparing_order"
    | "button_ready"
    | "error"
    | "client_success"
    | "client_failure";
  message: string;
  reference?: string; // This might be PayHero's reference from client-side event
}

interface OrderForPaymentDetails {
  orderId: string;
  externalReference: string;
  amount: number;
  phone?: string;
  name?: string;
}

// Declare PayHero on window for TypeScript
declare global {
  interface Window {
    PayHero?: {
      init: (options: any) => void;
    };
  }
}

const CheckoutPageSkeleton = () => {
  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16 animate-pulse">
          {/* Left Side: Delivery Details and Payment */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Delivery Details Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded dark:bg-gray-700 w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-5 bg-gray-300 rounded dark:bg-gray-700 w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded dark:bg-gray-700 w-full"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Payment Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded dark:bg-gray-700 w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 space-y-2">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mr-4"></div>
                    <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded dark:bg-gray-700 w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Side: Order Summary */}
          <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
            <div className="flow-root">
              <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/3"></div>
                    <div className="h-6 bg-gray-300 rounded dark:bg-gray-700 w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-16 bg-gray-300 rounded dark:bg-gray-700 w-full"></div>{" "}
            {/* Placeholder for status message */}
            <div className="h-12 bg-gray-300 rounded-lg dark:bg-gray-700 w-full"></div>{" "}
            {/* Placeholder for PayHero button area */}
          </div>
        </div>
      </div>
    </section>
  );
};

const CheckoutPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // For user and cart data
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: "idle",
    message: "",
  });
  const [orderDetailsForPayment, setOrderDetailsForPayment] =
    useState<OrderForPaymentDetails | null>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);

  const [countryName, setCountryName] = useState<string | null>(null);
  const [countyName, setCountyName] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);

  const primaryAddress = useMemo(
    () => ({
      // Memoize to stabilize dependency
      street: userData?.street || "",
      cityId: userData?.cityId || null,
      countyId: userData?.countyId || null,
      countryId: userData?.countryId || null,
    }),
    [userData]
  );

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (!userData) return;
      try {
        if (userData.countryId) {
          const res = await fetch(`/api/locations?id=${userData.countryId}`);
          if (res.ok) setCountryName((await res.json())[0]?.name || null);
        }
        if (userData.countyId) {
          const res = await fetch(`/api/locations?id=${userData.countyId}`);
          if (res.ok) setCountyName((await res.json())[0]?.name || null);
        }
        if (userData.cityId) {
          const res = await fetch(`/api/locations?id=${userData.cityId}`);
          if (res.ok) setCityName((await res.json())[0]?.name || null);
        }
      } catch (error) {
        console.error("Error fetching location names:", error);
      }
    };
    fetchLocationNames();
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        if (sessionStatus === "unauthenticated") router.push("/login"); // Redirect if not logged in
        return;
      }
      setPaymentStatus({
        status: "loading_data",
        message: "Loading your details...",
      });
      try {
        const [userResponse, cartResponse] = await Promise.all([
          fetch(`/api/users?id=${session.user.id}`),
          fetch(`/api/cart?userId=${session.user.id}`),
        ]);

        if (!userResponse.ok)
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        const user = await userResponse.json();
        setUserData(user);

        if (!cartResponse.ok)
          throw new Error(`Failed to fetch cart data: ${cartResponse.status}`);
        const cart = await cartResponse.json();
        setCartData({ items: cart.items, totalItems: cart.items.length });

        if (cart.items.length === 0) {
          toast.info("Your cart is empty. Redirecting to home page...");
          router.push("/");
          return;
        }
        setPaymentStatus({ status: "idle", message: "" }); // Data loaded, ready for next step
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setFetchError(errorMsg);
        setPaymentStatus({
          status: "error",
          message: `Error loading data: ${errorMsg}`,
        });
        toast.error(`Error loading data: ${errorMsg}`);
      } finally {
        setInitialLoading(false);
      }
    };

    if (sessionStatus === "authenticated") {
      fetchData();
    } else if (sessionStatus === "loading") {
      setPaymentStatus({
        status: "loading_data",
        message: "Authenticating...",
      });
    }
  }, [session?.user?.id, sessionStatus, router]);

  const generateExternalReference = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `INV-${new Date().getTime()}-${randomDigits}`; // More uniqueness
  };

  // FIX: Wrap createOrder in useCallback to prevent it from being recreated on every render.
  // This stabilizes the function and prevents the infinite loop in the useEffect hook that calls it.
  const createOrder = useCallback(
    async (currentTotal: number) => {
      if (!session?.user?.id || !cartData || !primaryAddress) {
        throw new Error(
          "Missing required order information (user, cart, or address)."
        );
      }

      const orderItems = cartData.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variation: item.variation,
      }));

      const externalReference = generateExternalReference();

      const orderData = {
        userId: session.user.id,
        items: orderItems,
        total: currentTotal, // Use the passed total
        countryId: primaryAddress.countryId,
        countyId: primaryAddress.countyId,
        cityId: primaryAddress.cityId,
        street: primaryAddress.street,
        paymentReference: externalReference,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Order creation failed:", data);
        throw new Error(data.error || data.message || "Failed to create order");
      }
      // Ensure your API returns id (orderId) and the externalReference
      return {
        orderId: data.id,
        externalReference,
        totalAmount: currentTotal,
      };
    },
    [session, cartData, primaryAddress]
  ); // Dependencies for useCallback

  const subtotal = cartData
    ? cartData.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
    : 0;
  const vatRate = 0.16;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  // Effect to prepare payment (create order) once data is ready
  useEffect(() => {
    const preparePayment = async () => {
      if (
        !session?.user?.id ||
        !cartData ||
        !userData ||
        total <= 0 ||
        orderDetailsForPayment ||
        initialLoading ||
        fetchError
      ) {
        return;
      }

      setPaymentStatus({
        status: "preparing_order",
        message: "Preparing your order...",
      });
      toast.info("Preparing your order...");

      try {
        // Pass the `total` calculated in this component render cycle
        const orderResult = await createOrder(total);
        const phoneNumber = userData?.number
          ? `0${userData.number.toString().slice(-9)}`
          : undefined;

        setOrderDetailsForPayment({
          orderId: orderResult.orderId,
          externalReference: orderResult.externalReference,
          amount: Math.ceil(orderResult.totalAmount), // Use amount from orderResult
          phone: phoneNumber,
          name: userData?.name || "Valued Customer",
        });
        // Status will be updated to 'button_ready' by the next effect if SDK is ready
      } catch (err) {
        console.error("Order Creation Error for PayHero:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to prepare your order.";
        setPaymentStatus({ status: "error", message: errorMessage });
        toast.error(errorMessage);
      }
    };

    if (
      sessionStatus === "authenticated" &&
      !initialLoading &&
      !fetchError &&
      total > 0 &&
      !orderDetailsForPayment
    ) {
      preparePayment();
    }
  }, [
    sessionStatus,
    initialLoading,
    fetchError,
    cartData,
    userData,
    total,
    orderDetailsForPayment,
    session?.user?.id,
    createOrder, // Now this dependency is stable thanks to useCallback
  ]);

  // Effect to initialize PayHero button
  useEffect(() => {
    if (
      isSDKReady &&
      typeof window.PayHero?.init === "function" &&
      orderDetailsForPayment &&
      paymentStatus.status !== "client_success"
    ) {
      const { orderId, externalReference, amount, phone, name } =
        orderDetailsForPayment;

      const container = document.getElementById("payHero");
      if (!container) {
        console.error("PayHero container not found");
        setPaymentStatus({
          status: "error",
          message: "Payment button container missing.",
        });
        toast.error("Payment button container missing.");
        return;
      }
      container.innerHTML = ""; // Clear previous button if any

      const lipwaUrl = process.env.NEXT_PUBLIC_PAYHERO_LIPWA_URL;
      const channelIdStr = process.env.NEXT_PUBLIC_PAYHERO_CHANNEL_ID;

      if (!lipwaUrl || !channelIdStr) {
        const msg =
          "Payment gateway configuration error. Please contact support.";
        console.error("PayHero configuration missing: LIPWA_URL or CHANNEL_ID");
        setPaymentStatus({ status: "error", message: msg });
        toast.error(msg);
        return;
      }
      const channelID = parseInt(channelIdStr);
      if (isNaN(channelID)) {
        const msg =
          "Payment gateway configuration error (Channel ID). Please contact support.";
        console.error(
          "PayHero configuration invalid: CHANNEL_ID is not a number"
        );
        setPaymentStatus({ status: "error", message: msg });
        toast.error(msg);
        return;
      }

      const payHeroOptions = {
        paymentUrl: lipwaUrl,
        width: "100%",
        height: "50px",
        containerId: "payHero",
        channelID: channelID,
        amount: amount,
        phone: phone,
        name: name,
        reference: externalReference,
        buttonName: `Pay Now ${amount.toLocaleString("en-KE", { style: "currency", currency: "KES" })}`,
        buttonColor: "#e21d48",
        successUrl: `${window.location.origin}/order/success?orderId=${orderId}&ref=${externalReference}`,
        failedUrl: `${window.location.origin}/checkout?payment_status=failed&orderId=${orderId}&ref=${externalReference}`,
        callbackUrl: `${window.location.origin}/api/payhero/callback`,
      };
      console.log("Initializing PayHero with:", payHeroOptions);
      window.PayHero.init(payHeroOptions);

      setPaymentStatus({
        status: "button_ready",
        message: "Please complete payment using the button below.",
      });
    }
  }, [isSDKReady, orderDetailsForPayment, paymentStatus.status]);

  // Effect for PayHero client-side messages
  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      // Basic security check for origin if PayHero specifies one, e.g.
      // if (event.origin !== "https://applet.payherokenya.com") return;

      if (event.data && typeof event.data.paymentSuccess !== "undefined") {
        if (event.data.paymentSuccess) {
          console.log("Payment Successful (client-side):", event.data);
          setPaymentStatus((prev) => ({
            ...prev,
            status: "client_success",
            message: "Payment successful! Awaiting final confirmation...",
            reference: event.data.reference,
          }));
          toast.success("Payment successful! Redirecting shortly...");
          // Redirection is handled by successUrl. If successUrl is null, redirect manually:
          // if (orderDetailsForPayment) router.push(`/order/success?orderId=${orderDetailsForPayment.orderId}`);
        } else {
          console.error("Payment Failed (client-side):", event.data);
          setPaymentStatus((prev) => ({
            ...prev,
            status: "client_failure",
            message:
              "Payment failed on client. Please try again or check your details.",
            reference: event.data.reference,
          }));
          toast.error(
            event.data.message || "Payment failed. Please try again."
          );
          // Redirection is handled by failedUrl. If failedUrl is null, handle here:
          // if (orderDetailsForPayment) router.push(`/checkout?payment_status=failed&ref=${orderDetailsForPayment.externalReference}`);
        }
      }
    };

    window.addEventListener("message", handlePaymentMessage);
    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [orderDetailsForPayment]); // orderDetailsForPayment might be needed if manually redirecting

  if (initialLoading || sessionStatus === "loading") {
    return <CheckoutPageSkeleton />;
  }

  if (fetchError) {
    // Already handled by toast, but you can show a more prominent error UI here
    return (
      <div className="text-center py-10 text-red-500">
        Error: {fetchError}. Please try refreshing the page.
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    // This case should ideally be handled by the redirect in fetchData,
    // but as a fallback:
    if (!initialLoading) router.push("/");
    return <CheckoutPageSkeleton />; // Or null, or a message "Your cart is empty"
  }

  const formattedSubtotal = subtotal.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
  });
  const formattedVAT = vat.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
  });
  const formattedTotal = total.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
  });

  return (
    <>
      <Script
        src="https://applet.payherokenya.com/cdn/button_sdk.js?v=3.1"
        onLoad={() => {
          console.log("PayHero SDK loaded.");
          setIsSDKReady(true);
        }}
        onError={(e) => {
          console.error("Failed to load PayHero SDK", e);
          setPaymentStatus({
            status: "error",
            message:
              "Payment gateway failed to load. Please refresh and try again.",
          });
          toast.error(
            "Payment gateway failed to load. Please refresh and try again."
          );
        }}
        strategy="afterInteractive" // Load after page is interactive
      />
      <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
        {/* Remove the <form> wrapper if it's no longer needed for other purposes */}
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
            <div className="min-w-0 flex-1 space-y-8">
              {/* Delivery Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                  Checkout Details
                  <button
                    type="button"
                    onClick={() => router.push("/account")}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500"
                  >
                    Edit
                  </button>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="your_name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      Name{" "}
                    </label>
                    <input
                      disabled
                      value={userData?.name || ""}
                      type="text"
                      id="your_name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="your_email"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      Email{" "}
                    </label>
                    <input
                      disabled
                      value={userData?.email || ""}
                      type="email"
                      id="your_email"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="street"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      Street Name{" "}
                    </label>
                    <input
                      disabled
                      value={primaryAddress?.street || ""}
                      type="text"
                      id="street"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Street"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      Country{" "}
                    </label>
                    <input
                      disabled
                      value={countryName || ""}
                      type="text"
                      id="country"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="county"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      County{" "}
                    </label>
                    <input
                      disabled
                      value={countyName || ""}
                      type="text"
                      id="county"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="County"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      City{" "}
                    </label>
                    <input
                      disabled
                      value={cityName || ""}
                      type="text"
                      id="city"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone-input-3"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {" "}
                      Phone Number{" "}
                    </label>
                    <input
                      disabled
                      value={
                        userData?.number
                          ? `0${userData.number.toString().slice(-9)}`
                          : ""
                      }
                      type="text"
                      id="phone-input"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection (can be simplified if PayHero is the only option) */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="payhero-method"
                        aria-describedby="payhero-method-text"
                        type="radio"
                        name="payment-method"
                        className="h-4 w-4 border-gray-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700"
                        checked
                        readOnly
                      />
                    </div>
                    <div className="ms-4 text-sm">
                      <label
                        htmlFor="payhero-method"
                        className="font-medium leading-none text-gray-900 dark:text-white"
                      >
                        {" "}
                        Secure Payment via Pay Hero{" "}
                      </label>
                      <p
                        id="payhero-method-text"
                        className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400"
                      >
                        Uses M-Pesa and other methods.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
              <div className="flow-root">
                <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800">
                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Subtotal
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {formattedSubtotal}
                    </dd>
                  </dl>
                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      VAT (16%)
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {formattedVAT}
                    </dd>
                  </dl>
                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Total (VAT incl.)
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      {formattedTotal}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Payment Status & Button Area */}
              {paymentStatus.message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    paymentStatus.status === "error" ||
                    paymentStatus.status === "client_failure"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : paymentStatus.status === "client_success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  }`}
                >
                  {paymentStatus.message}
                </div>
              )}

              <div className="space-y-3">
                {(paymentStatus.status === "loading_data" ||
                  paymentStatus.status === "preparing_order") && (
                  <div className="h-12 flex items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-700 w-full text-gray-600 dark:text-gray-400 animate-pulse">
                    {paymentStatus.message || "Loading..."}
                  </div>
                )}
                {/* This div will host the PayHero button */}
                <div
                  id="payHero"
                  className={
                    (paymentStatus.status === "button_ready" ||
                      paymentStatus.status === "client_success" ||
                      paymentStatus.status === "client_failure") &&
                    orderDetailsForPayment &&
                    isSDKReady
                      ? "block" // Show if button is ready or interaction happened
                      : "hidden" // Hide otherwise
                  }
                >
                  {/* PayHero SDK injects the button here */}
                </div>
                {paymentStatus.status === "error" &&
                  !orderDetailsForPayment && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()} // Simple retry by reloading
                      className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                      Retry
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
