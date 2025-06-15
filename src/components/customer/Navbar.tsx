'use client';
import { signOut, useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

const Navbar = () => {
    const { data: session, status } = useSession(); // Get session status
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [cookieNoticeDismissed, setCookieNoticeDismissed] = useState(true);
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);

    useEffect(() => {
        const dismissed = localStorage.getItem('cookieNoticeDismissed') === 'true';
        setCookieNoticeDismissed(dismissed);
        setShowCookieBanner(!dismissed);

        if (!dismissed) {
            setTimeout(() => {
                setShowCookieBanner(true);
            }, 50);
        }

    }, []);

    const handleDismissCookieNotice = () => {
        setShowCookieBanner(false);

        setTimeout(() => {
            setCookieNoticeDismissed(true);
            localStorage.setItem('cookieNoticeDismissed', 'true');
        }, 300);

    };


    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]); //Product suggestions
    const [searchHistory, setSearchHistory] = useState<string[]>([]); // Store search history
    const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);  // Track focus state
    const [isSearchExpanded, setIsSearchExpanded] = useState(false); // Track if search is expanded

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            const result = await signIn('google', { callbackUrl: pathname }); // Use pathname for current page
            if (result?.error) {
                toast.error("Failed to sign in with Google");
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast.error("An unexpected error occurred during Google sign-in.");
        } finally {
            setIsLoading(false);
        }
    };

    // Load search history from cookies on mount
    useEffect(() => {
        const savedHistory = document.cookie
            .split('; ')
            .find((row) => row.startsWith('searchHistory='))
            ?.split('=')[1];

        if (savedHistory) {
            setSearchHistory(JSON.parse(decodeURIComponent(savedHistory)));
        }
    }, []);

    // Save search history to cookies whenever it changes
    useEffect(() => {
        const encodedHistory = encodeURIComponent(JSON.stringify(searchHistory));
        document.cookie = `searchHistory=${encodedHistory}; max-age=${60 * 60 * 24 * 7}; path=/`; // Expires in 7 days

    }, [searchHistory]);


    const fetchSearchResults = useCallback(async (term: string) => {
        // Replace this with your actual API endpoint for fetching search suggestions
        try {
            const response = await fetch(`/api/search-suggestions?q=${term}`); // Example API endpoint
            if (!response.ok) {
                throw new Error('Failed to fetch search suggestions');
            }
            const data = await response.json();
            setSearchResults(data.results || []); // Assuming the API returns an array of strings in `data.results`

        } catch (error) {
            console.error("Error fetching search suggestions:", error);
            setSearchResults([]);
        }
    }, []);


    // Debounced Search
    useEffect(() => {
        if (searchTerm) {
            const delayDebounceFn = setTimeout(() => {
                fetchSearchResults(searchTerm);
            }, 300); // 300ms delay

            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]); // Clear suggestions when search term is empty
        }
    }, [searchTerm, fetchSearchResults]);

    // Handle click outside of search container
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsSearchExpanded(false);
                setIsSearchInputFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm) {
            // Update search history
            setSearchHistory((prevHistory) => {
                const newHistory = [searchTerm, ...prevHistory.filter((item) => item !== searchTerm)]; // Add to beginning and remove duplicates
                return newHistory.slice(0, 5); // Limit to 5 items
            });

            setIsSearchExpanded(false);
            router.push(`/shop?search=${searchTerm}`, { scroll: false });
        } else {
            router.push('/shop', { scroll: false }); // Redirect to /shop if search term is empty
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setSearchResults([]); // Hide suggestions after click
        setIsSearchInputFocused(false); // Clear focus
        setIsSearchExpanded(false); // Collapse the search
        
        // Update search history
        setSearchHistory((prevHistory) => {
            const newHistory = [suggestion, ...prevHistory.filter((item) => item !== suggestion)];
            return newHistory.slice(0, 5);
        });
        
        router.push(`/shop?search=${suggestion}`, { scroll: false });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleInputFocus = () => {
        setIsSearchInputFocused(true);
        setIsSearchExpanded(true);
    };

    const clearSearchTerm = () => {
        setSearchTerm('');
        setSearchResults([]);
        setIsSearchInputFocused(true); 
        
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Conditional rendering based on session status
    if (status === "loading") {
        return (
            <>
                <nav className="bg-white dark:bg-gray-800 antialiased">
                    <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-8">
                                <div className="shrink-0">
                                    <Link href="/" title="">
                                        <Image
                                            className="hidden w-auto h-8 dark:block"
                                            width={'32'}
                                            height={'32'}
                                            src="/logob.svg"
                                            alt=""
                                        />
                                    </Link>
                                </div>

                                <div className="hidden md:block">
                                    <div className="w-full max-w-xl">
                                        <input
                                            type="text"
                                            placeholder="Loading search..."
                                            className="w-full rounded-md border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            disabled // Disable the input while loading
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center lg:space-x-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium leading-none text-gray-900 dark:text-white"
                                    disabled
                                >
                                    <span className="sr-only">Cart</span>
                                    <svg
                                        className="w-5 h-5 lg:me-1"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"
                                        />
                                    </svg>
                                    <span className="hidden sm:flex">My Tickets</span>
                                </button>

                                <button
                                    className="gsi-material-button hidden md:inline-flex"
                                    disabled
                                >
                                    <div className="gsi-material-button-state"></div>
                                    <div className="gsi-material-button-content-wrapper">
                                        <div className="gsi-material-button-icon">
                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                <path fill="none" d="M0 0h48v48H0z"></path>
                                            </svg>
                                        </div>
                                        <span className="gsi-material-button-contents">Loading...</span>
                                        <span style={{ display: 'none' }}>Loading...</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                                type="text"
                                placeholder="Loading search..."
                                className="w-full rounded-md border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                disabled // Disable the input while loading
                            />
                </div>
            </>
        );
    }

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 antialiased">
                <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <div className="shrink-0">
                                <Link href="/" title="">
                                    <Image
                                        className="hidden w-auto h-8 dark:block"
                                        width={'32'}
                                        height={'32'}
                                        src="/logob.svg"
                                        alt=""
                                    />
                                </Link>
                            </div>

                            <div 
                                ref={searchContainerRef}
                                className={`relative hidden md:block transition-all duration-200 ease-in-out ${
                                    isSearchExpanded ? 'w-full max-w-3xl z-20' : 'w-full max-w-xl'
                                }`}
                            >
                                <form
                                    onSubmit={handleSearch}
                                    className="w-full"
                                >
                                    <div className="relative">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleInputChange}
                                            onFocus={handleInputFocus}
                                            placeholder="Search Events..."
                                            className={`w-full rounded-t-md ${!isSearchExpanded || (!searchTerm && !searchHistory.length) ? 'rounded-b-md' : ''} border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white pr-10 transition-all duration-200`}
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={clearSearchTerm}
                                                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button 
                                            type="submit" 
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <Search className="h-5 w-5" />
                                        </button>
                                    </div>
                                    
                                    {/* Integrated Suggestions and History Container */}
                                    {isSearchExpanded && (searchTerm ? searchResults.length > 0 : searchHistory.length > 0) && (
                                        <div className="absolute left-0 right-0 bg-white border-x border-b border-gray-200 rounded-b-md shadow-md dark:bg-gray-700 dark:border-gray-600 max-h-80 overflow-y-auto">
                                            <ul>
                                                {searchTerm ? (
                                                    // Show search results/suggestions
                                                    searchResults.map((result, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(result)}
                                                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white flex items-center"
                                                        >
                                                            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                            <span>{result}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    // Show search history
                                                    <>
                                                        <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">
                                                            Recent searches
                                                        </li>
                                                        {searchHistory.map((historyItem, index) => (
                                                            <li
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(historyItem)}
                                                                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center">
                                                                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                                    <span>{historyItem}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSearchHistory(prev => prev.filter(item => item !== historyItem));
                                                                    }}
                                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="flex items-center lg:space-x-2">
                            <button
                                onClick={() => router.push('/cart')}
                                id="cartBtn"
                                type="button"
                                className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium leading-none text-gray-900 dark:text-white"
                            >
                                <span className="sr-only">Cart</span>
                                <svg
                                    className="w-5 h-5 lg:me-1"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"
                                    />
                                </svg>
                                <span className="hidden sm:flex">My Tickets</span>
                            </button>

                            {session ? (
                                <div ref={dropdownRef} className="relative">
                                    <Select onValueChange={(value) => {
                                        if (value === 'account') {
                                            router.push('/account');
                                        } else if (value === 'wishlist') {
                                            router.push('/wishlist');
                                        } else if (value === 'orders') {
                                            router.push('/account/orders');
                                        } else if (value === 'signout') {
                                            signOut();
                                        }
                                    }}>
                                        <SelectTrigger className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium leading-none text-gray-900 dark:text-white">
                                            <svg
                                                className="w-5 h-5 me-1"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                            </svg>
                                            Account
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="account">My Account</SelectItem>
                                            <SelectItem value="orders">My Orders</SelectItem>
                                            <SelectItem value="wishlist">Wishlist</SelectItem>
                                            <SelectItem value="signout">Sign Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="gsi-material-button hidden md:inline-flex" // Visible on medium screens and up
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                    >
                                        <div className="gsi-material-button-state"></div>
                                        <div className="gsi-material-button-content-wrapper">
                                            <div className="gsi-material-button-icon">
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                                </svg>
                                            </div>
                                            <span className="gsi-material-button-contents">{isLoading ? 'Continuing with Google...' : 'Continue with Google'}</span>
                                            <span style={{ display: 'none' }}>{isLoading ? 'Continuing with Google...' : 'Continue with Google'}</span>
                                        </div>
                                    </button>


                                    <button
                                        className="gsi-material-button md:hidden" // Visible only on small screens
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                    >
                                        <div className="gsi-material-button-state"></div>
                                        <div className="gsi-material-button-content-wrapper">
                                            <div className="gsi-material-button-icon">
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                                </svg>
                                            </div>
                                            <span style={{ display: 'none' }}>Continue with Google</span>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Search Bar (Fully-expandable) */}
            <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div 
                    ref={searchContainerRef}
                    className="relative w-full"
                >
                    <form
                        onSubmit={handleSearch}
                        className="w-full"
                    >
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Search Events..."
                                className={`w-full rounded-t-md ${!isSearchExpanded || (!searchTerm && !searchHistory.length) ? 'rounded-b-md' : ''} border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white pr-10`}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearchTerm}
                                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                            <button 
                                type="submit" 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Integrated Mobile Suggestions and History */}
                        {isSearchExpanded && (searchTerm ? searchResults.length > 0 : searchHistory.length > 0) && (
                            <div className="absolute left-0 right-0 bg-white border-x border-b border-gray-200 rounded-b-md shadow-md dark:bg-gray-700 dark:border-gray-600 max-h-80 overflow-y-auto z-50">
                                <ul>
                                    {searchTerm ? (
                                        searchResults.map((result, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleSuggestionClick(result)}
                                                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white flex items-center"
                                            >
                                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                <span>{result}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <>
                                            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray00">
                                                Recent searches
                                            </li>
                                            {searchHistory.map((historyItem, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(historyItem)}
                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                        <span>{historyItem}</span>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSearchHistory(prev => prev.filter(item => item !== historyItem));
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/*}

            {showCookieBanner && (
                <div className={`fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-4 flex items-center justify-between z-50
    ${showCookieBanner ? 'fade-in' : 'fade-out'}`}
                >
                    <div>
                        <p className="text-sm">
                            This website uses essential cookies to function properly. By continuing to use this site, you consent to our use of these cookies.  See our{' '}
                            <Link href="/cookie-policy" className="text-blue-500 underline">
                                Cookie Policy
                            </Link>
                            for more details.
                        </p>
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={handleDismissCookieNotice}
                            className="bg-primary-700 text-white rounded-md px-4 py-2 text-sm hover:bg-primary-800"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            */}
        </>
    );
};

export default Navbar;
