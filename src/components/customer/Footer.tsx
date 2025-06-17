 'use client'
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const Footer = () => {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully subscribed to the newsletter!');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white antialiased dark:bg-gray-800">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="border-b border-gray-100 py-6 dark:border-gray-700 md:py-8 lg:py-12">
          <div className="items-start gap-8 lg:flex 2xl:gap-24">
            {/* Main footer links section - reorganized */}
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-8 md:grid-cols-3 xl:gap-12">
              {/* Shopping section */}
              <div>
                <h6 className="mb-4 text-sm font-semibold uppercase text-gray-900 dark:text-white">Merchandise</h6>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="https://kemun.co.ke/products/new-arrivals"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                   Upcoming Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://kemun.co.ke/products/best-sellers"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                    Best Sellers
                    </Link>
                  </li>
              
                </ul>
              </div>

              {/* Orders section */}
              <div>
                <h6 className="mb-4 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                 ORDERS
                </h6>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="https://kemun.co.ke/account/orders"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                    
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://kemun.co.ke/account/history"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Purchase History
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://kemun.co.ke/return-policy"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Returns & Exchanges
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support section */}
              <div>
                <h6 className="mb-4 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                More
                </h6>
                <ul className="space-y-3">
            
                  <li>
                    <Link
                      href="https://kemun.co.ke/faqs"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://kemun.co.ke/shipping-info"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                     
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter and App section */}
            <div className="mt-8 w-full lg:mt-0 lg:max-w-lg">
              <div className="space-y-5 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">

          {/* Newsletter subscription form */}
<form onSubmit={handleSubmit}>
  <div className="items-end space-y-4 sm:flex sm:space-y-0">
    <div className="relative mr-3 w-full sm:w-96 lg:w-full">
      <label
        htmlFor="email"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        Get the latest deals and more.
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
        placeholder="Enter your email address"
        className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500 sm:w-96 lg:w-full"
      />
    </div>
    <div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full cursor-pointer rounded-lg bg-primary-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
    </div>
  </div>
</form>
                <hr className="border-gray-200 dark:border-gray-600" />

                {/* Mobile app section */}
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Get your tickets with{' '}
                    <Link href="#" className="underline hover:no-underline">
                    KeMUNConnect App
                    </Link>
                  </p>

                  <div className="gap-4 space-y-4 sm:flex sm:space-y-0">
                    {/* Android app download */}
                    <Link
                      href="https:///android"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-gray-800 px-4 py-2.5 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800 sm:w-auto"
                    >
                      <svg className="mr-3 h-7 w-7" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google-play" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"></path>
                  </svg>
                      <div className="text-left">
                        <div className="mb-1 text-xs">Get it on</div>
                        <div className="-mt-1 font-sans text-sm font-semibold">Google Play</div>
                      </div>
                    </Link>

                    {/* iOS app download */}
                    <Link
                      href="#"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-gray-800 px-4 py-2.5 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800 sm:w-auto"
                    >
                      <svg
                        className="mr-3 h-7 w-7"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="apple"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                      >
                        <path
                          fill="currentColor"
                          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                        ></path>
                      </svg>
                      <div className="text-left">
                        <div className="mb-1 text-xs">Download on the</div>
                        <div className="-mt-1 font-sans text-sm font-semibold">App Store</div>
                      </div>
                    </Link>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-600" />

                {/* Social media links */}
                <div>
                  <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Follow Us</h6>
                  <div className="flex space-x-5">
                    <Link href="https://www.instagram.com/kmun.kemunairobi?igsh=MWI3NHQ2cnFtZDNxNA==" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                    
                    <Link href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5 icon icon-tabler icons-tabler-outline icon-tabler-brand-tiktok">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer with copyright and policies */}
        <div className="py-6 md:py-8">
          <div className="gap-4 space-y-5 xl:flex xl:items-center xl:justify-between xl:space-y-0">
            {/* Logo */}
            <Link href="/" className="block">
              <Image
                className="h-8 w-auto"
                width={'32'}
                height={'32'}
                src="/logob.svg"
                alt="KeMUNConnect"
              />
            </Link>

            {/* Legal links - made more compact */}
            <ul className="flex flex-wrap items-center gap-4 text-sm text-gray-900 dark:text-white xl:justify-center">
              <li>
                <Link href="https://kemun.co.ke/privacy-policy" className="font-medium hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="https://kemun.co.ke/terms-and-conditions" className="font-medium hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="https://kemun.co.ke/return-policy" className="font-medium hover:underline">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="https://kemun.co.ke/cookie-policy" className="font-medium hover:underline">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="https://kemun.co.ke/disclaimer" className="font-medium hover:underline">
                  Legal Notice
                </Link>
              </li>
            </ul>

            {/* Copyright */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()}{' '}
              <Link href="/" className="hover:underline">
              KeMUNConnect
              </Link>
              , Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
