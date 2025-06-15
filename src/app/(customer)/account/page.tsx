'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PushNotificationManager from '@/components/PushNotification';

interface Location {
  id: string;
  name: string;
}

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  number: number;
  countryId: string | null;
  countyId: string | null;
  cityId: string | null;
  street: string | null;
  orders: Order[];
}

interface FormData {
  name: string;
  email: string;
  number: string;
  street: string;
  countryId: string;
  countyId: string;
  cityId: string;
}

const AccountPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const {data: session} = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Location[]>([])
  const [counties, setCounties] = useState<Location[]>([])
  const [cities, setCities] = useState<Location[]>([])
  const [countryName, setCountryName] = useState<string | null>(null);
  const [countyName, setCountyName] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);

  const [isSubmitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    number: '',
    street: '',
    countryId: '',
    countyId: '',
    cityId: '',
  })

  const [isOpen, setIsOpen] = useState(false);

    // Function to get user's initials
    const getInitials = (name: string | undefined) => {
      if (!name) return '';
      const nameParts = name.split(' ');
      const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join('');
      return initials;
    };

  useEffect(() => {
    // Redirect to home if session is unauthenticated
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
      return;
    }

    // Only fetch data when session is authenticated
    if (sessionStatus === 'authenticated') {
      const fetchData = async () => {
        try {
          // Fetch user data
          const userResponse = await fetch(`/api/users?id=${session?.user?.id}`); // Use query parameter to fetch user
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.status}`);
          }
           const user = await userResponse.json();

            if (!user) {
                setError('User not found.');
                return;
            }
          setUserData(user);

          // Prefill form data
          setFormData({
            name: user.name || '',
            email: user.email || '',
            number: user.number ? user.number.toString() : '',
            street: user.street || '',
            countryId: user.countryId || '',
            countyId: user.countyId || '',
            cityId: user.cityId || '',
          });

          // Fetch initial locations based on user's existing data
            if (user.countryId) {
                fetchCounties(user.countryId);
                fetchLocationName('country', user.countryId, setCountryName);
            }
            if (user.countyId) {
                fetchCities(user.countyId);
                fetchLocationName('county', user.countyId, setCountyName);
            }
            if (user.cityId) {
                fetchLocationName('city', user.cityId, setCityName);
            }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [sessionStatus, session?.user?.id, router]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/locations?type=country')
        if (response.ok) {
          const data = await response.json()
          setCountries(data)
        }
      } catch (error) {
        console.error('Error fetching countries:', error)
      }
    }
    fetchCountries()
  }, [])

  const fetchCounties = async (countryId: string) => {
    try {
      const response = await fetch(`/api/locations?type=county&countryId=${countryId}`)
      if (response.ok) {
        const data = await response.json()
        setCounties(data)
      }
    } catch (error) {
      console.error('Error fetching counties:', error)
    }
  }

  const fetchCities = async (countyId: string) => {
    try {
      const response = await fetch(`/api/locations?type=city&countyId=${countyId}`)
      if (response.ok) {
        const data = await response.json()
        setCities(data)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchLocationName = async (
  type: 'country' | 'county' | 'city',
  id: string | null,
  setState: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!id) {
    setState(null);
    return;
  }
  try {
    const url = `/api/locations?id=${id}&type=${type}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        setState(data[0]?.name || null);
      } else {
        setState(null); // No data found for the ID
      }
    } else {
      setState(null);
      console.error(`Failed to fetch ${type} name:`, response.status);
    }
  } catch (error) {
    setState(null);
    console.error(`Error fetching ${type} name:`, error);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCountryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, countryId: value, countyId: '', cityId: '' }));
        setCounties([]);
        setCities([]);
        setCountryName(null);
        setCountyName(null);
        setCityName(null);
        if (value) {
            fetchCounties(value);
            fetchLocationName('country', value, setCountryName);
        }
    };

    const handleCountyChange = (value: string) => {
        setFormData((prev) => ({ ...prev, countyId: value, cityId: '' }));
        setCities([]);
        setCountyName(null);
        setCityName(null);
        if (value) {
            fetchCities(value);
            fetchLocationName('county', value, setCountyName);
        }
    };

    const handleCityChange = (value: string) => {
        setFormData((prev) => ({ ...prev, cityId: value }));
        setCityName(null);
        if(value){
          fetchLocationName('city', value, setCityName)
        }
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/users?id=${session.user.id}`, { // Use query parameter for user ID
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: parseInt(formData.number),
          street: formData.street,
          countryId: formData.countryId,
          countyId: formData.countyId,
          cityId: formData.cityId,
        })
      });

      if (!response.ok) {
        toast.error('Failed to Update Info');
        throw new Error('Failed to update user information');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      toast.success('Info Updated Successfully');
    } catch (error) {
      console.error('Error updating user information:', error);
      toast.error('Error updating user information');
    } finally {
      setIsOpen(false);
      setSubmitting(false);
    }
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (


<section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
    {loading || sessionStatus === 'loading' ? (

<div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl md:mb-6">
    <div className="h-6 w-1/2 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
  </h2>

  <div className="py-4 md:py-8">
    <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
      {/* Personal Info Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="h-8 w-1/2 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Contact Info Skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-10 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    {/* Edit Button Skeleton */}
    <div className="h-10 w-full animate-pulse bg-gray-300 dark:bg-gray-700 sm:w-auto"></div>
  </div>

  {/* Orders Skeleton */}
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:p-8">
    <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
      <div className="h-6 w-1/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
    </h3>

    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="flex flex-wrap items-center gap-y-4 border-b border-gray-200 pb-4 dark:border-gray-700 md:pb-5"
      >
        <div className="w-1/2 sm:w-48 space-y-2">
          <div className="h-4 w-2/3 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="w-1/2 sm:w-1/4 md:flex-1 lg:w-auto space-y-2">
          <div className="h-4 w-1/2 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="w-1/2 sm:w-1/5 md:flex-1 lg:w-auto space-y-2">
          <div className="h-4 w-1/2 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="w-1/2 sm:w-1/4 sm:flex-1 lg:w-auto space-y-2">
          <div className="h-4 w-1/2 animate-pulse bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-6 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="w-full sm:w-32 sm:items-center sm:justify-end sm:gap-4">
          <div className="h-10 w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    ))}
  </div>
</div>

    ) : (

      <>

      <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl md:mb-6">General overview</h2>
              {/* Avatar */}
              <div className="relative inline-flex shrink-0 rounded-full overflow-hidden">
                  <span className="relative flex h-10 w-10 items-center justify-center bg-gray-100 font-medium uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {getInitials(userData?.name)}
                  </span>
              </div>
          </div>
    <div className="py-4 md:py-8">
      <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div>
              <h2 className="flex items-center text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">{userData?.name}</h2>
            </div>
          </div>
          <dl className="">
            <dt className="font-semibold text-gray-900 dark:text-white">Email Address</dt>
            <dd className="text-gray-500 dark:text-gray-400">{userData?.email}</dd>
          </dl>
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">Campus Base</dt>
            <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              {userData?.street}, {cityName}, {countyName}, {countryName}
            </dd>
          </dl>
        </div>
        <div className="space-y-4">
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">Phone Number</dt>
            <dd className="text-gray-500 dark:text-gray-400">{userData?.number}</dd>
          </dl>
          <dl>
            <dt className="mb-1 font-semibold text-gray-900 dark:text-white">Payment Methods</dt>
            <dd className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <div>
                <div className="text-sm">
                  <p className="mb-0.5 font-medium text-gray-900 dark:text-white">M-Pesa</p>
                  <p className="font-normal text-gray-500 dark:text-gray-400">{userData?.number}</p>
                </div>
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={() => setIsOpen(true)}>
            Edit your data
        </Button>

          <Button onClick={() => router.push('/account/orders')}>
              View Orders
          </Button>
                </div>
                <PushNotificationManager />
    </div>

  </div>
  { /* ===== Account Information Modal ===== */ }
        <div id="accountInformationModal2" tabIndex={-1} aria-hidden="true" className={`${isOpen ? 'flex' : 'hidden'} max-h-auto fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden antialiased md:inset-0`}>
          <div className="max-h-auto relative max-h-full w-full max-w-lg p-4">
            <div className="relative rounded-lg bg-white shadow dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="accountInformationModal2">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 66m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-5">
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="full_name_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Your Full Name*
                    </label>
                    <input
                      type="text"
                      id="full_name_info_modal"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="email_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Your Email*
                    </label>
                                        <input
                      type="email"
                      id="email_info_modal"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="Enter your email here"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="phone-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Phone Number*
                    </label>
                    <div className="flex items-center">
                      <input
                        type="tel"
                        id="phone-input"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        pattern="[0-9]{9}"
                        className="z-20 block w-full rounded-e-lg border border-s-0 border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:border-s-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500"
                        placeholder="0712345678"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="select_country_input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Country*
                    </label>
                    <Select onValueChange={handleCountryChange} defaultValue={formData.countryId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((country) => (
                                <SelectItem key={country.id} value={country.id}>
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="select_county_input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Campus Base*
                    </label>
                    <Select onValueChange={handleCountyChange} value={formData.countyId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select County" />
                        </SelectTrigger>
                        <SelectContent>
                            {counties.map((county) => (
                                <SelectItem key={county.id} value={county.id}>
                                    {county.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="select_city_input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      City*
                    </label>
                    <Select onValueChange={handleCityChange} value={formData.cityId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="street_input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      KMUN ID*
                    </label>
                    <Textarea
                      id="street_input"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500"
                      placeholder="Enter your street address"
                      required
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
                <Button
  type="submit"
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Updating...' : 'Update'}
</Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsOpen(false)}
                    data-modal-toggle="accountInformationModal2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

</>

                    )}
                    </section>

  )
}

export default AccountPage
