'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface LocationData {
    id: string;
    name: string;
}

interface UserDetails {
    countryId: string;
    countyId: string;
    cityId: string;
    street: string;
    number: string;
}

export const UserDetailsDialog = () => {
    const { data: session, status } = useSession();
    const userID = session?.user?.id;

    const [open, setOpen] = useState(false);
    const [needsDetails, setNeedsDetails] = useState(false);
    const [countries, setCountries] = useState<LocationData[]>([]);
    const [counties, setCounties] = useState<LocationData[]>([]);
    const [cities, setCities] = useState<LocationData[]>([]);
    const [userDetails, setUserDetails] = useState<UserDetails>({
        countryId: '',
        countyId: '',
        cityId: '',
        street: '',
        number: '',
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesResponse = await fetch('/api/locations?type=country');
                if (countriesResponse.ok) {
                    const countriesData = await countriesResponse.json();
                    setCountries(countriesData);
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchCounties = async () => {
            if (userDetails.countryId) {
                try {
                    const countiesResponse = await fetch(`/api/locations?type=county&countryId=${userDetails.countryId}`);
                    if (countiesResponse.ok) {
                        const countiesData = await countiesResponse.json();
                        setCounties(countiesData);
                    }
                } catch (error) {
                    console.error('Error fetching counties:', error);
                }
            }
        };

        fetchCounties();
    }, [userDetails.countryId]);

    useEffect(() => {
        const fetchCities = async () => {
            if (userDetails.countyId) {
                try {
                    const citiesResponse = await fetch(`/api/locations?type=city&countyId=${userDetails.countyId}`);
                    if (citiesResponse.ok) {
                        const citiesData = await citiesResponse.json();
                        setCities(citiesData);
                    }
                } catch (error) {
                    console.error('Error fetching cities:', error);
                }
            }
        };

        fetchCities();
    }, [userDetails.countyId]);

    useEffect(() => {
        const checkUserDetails = async () => {
            if (status === 'authenticated' && userID) {
                try {
                    const response = await fetch(`/api/users?id=${userID}`);
                    if (response.ok) {
                        const userData = await response.json();
                        const hasLocation = userData.countryId && userData.countyId && userData.cityId && userData.street;
                        const hasNumber = userData.number && userData.number !== "";

                        setNeedsDetails(!hasLocation || !hasNumber);
                        setOpen(!hasLocation || !hasNumber);
                    } else {
                        console.error('Failed to fetch user details');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            } else {
                setNeedsDetails(false);
                setOpen(false)
            }
        };

        checkUserDetails();
    }, [status, userID]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitDetails = async () => {
        try {
            let formattedNumber = userDetails.number;

            // Remove the plus sign if present
            formattedNumber = formattedNumber.replace('+', '');

            if (formattedNumber.startsWith('0')) {
                // Replace leading 0 with 254
                formattedNumber = '254' + formattedNumber.substring(1);
            }

            if (!formattedNumber.startsWith('254')) {
                // If it doesn't start with 254, prepend 254
                formattedNumber = '254' + formattedNumber;
            }

            // Enforce a total length of 12 characters
            if (formattedNumber.length > 12) {
                formattedNumber = formattedNumber.substring(0, 12);
            }

            setUserDetails((prev) => ({ ...prev, number: formattedNumber }));

            const response = await fetch(`/api/users?id=${userID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    countryId: userDetails.countryId,
                    countyId: userDetails.countyId,
                    cityId: userDetails.cityId,
                    street: userDetails.street,
                    number: formattedNumber,
                }),
            });

            if (response.ok) {
                toast.success('User details updated successfully!');
                setOpen(false);
                setNeedsDetails(false);
            } else {
                toast.error('Failed to update user details');
            }
        } catch (error) {
            console.error('Error updating user details:', error);
            toast.error('Error updating user details');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Please Provide Your Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* COUNTRY */}
                        <div>
                            <label htmlFor="countryId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Citizen
                            </label>
                            <Select
                                name="countryId"
                                value={userDetails.countryId}
                                onValueChange={(value) => setUserDetails((prev) => ({ ...prev, countryId: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Role" />
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

                        {/* COUNTY */}
                        <div>
                            <label htmlFor="countyId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Campus
                            </label>
                            <Select
                                name="countyId"
                                value={userDetails.countyId}
                                onValueChange={(value) => setUserDetails((prev) => ({ ...prev, countyId: value }))}
                                disabled={!userDetails.countryId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Campus Base" />
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

                        {/* CITY */}
                        <div>
                            <label htmlFor="cityId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                City
                            </label>
                            <Select
                                name="cityId"
                                value={userDetails.cityId}
                                onValueChange={(value) => setUserDetails((prev) => ({ ...prev, cityId: value }))}
                                disabled={!userDetails.countyId}
                            >
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

                        {/* STREET */}
                        <div>
                            <label htmlFor="street" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                KMUN ID
                            </label>
                            <Input
                                type="text"
                                name="street"
                                id="street"
                                value={userDetails.street}
                                onChange={handleDetailsChange}
                                placeholder="Enter your KMUN ID"
                                required
                            />
                        </div>

                        {/* PHONE */}
                        <div>
                            <label htmlFor="number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Phone Number (without 0, e.g., 712345678)
                            </label>
                            <Input
                                type="number"
                                name="number"
                                id="number"
                                value={userDetails.number}
                                onChange={handleDetailsChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmitDetails}
                            className="inline-flex items-center rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
                        >
                            Update Details
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
