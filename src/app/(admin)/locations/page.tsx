'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    MapPin, 
    Plus, 
    ChevronDown, 
    Trash2,
    Edit2 
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type City = {
    id: string;
    name: string;
};

type Location = {
    id: string;
    name: string;
    type: string;
    countryId: string;
    countyId: string;
    shippingCost: number;
    country: { name: string };
    county: { name: string };
};

const LocationPage = () => {
    const [locations, setLocations] = useState<Location[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null)
    const [loading, setloading] = useState(true);
    const router = useRouter();
    const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [countries, setCountries] = useState<Location[]>([]);
    const [counties, setCounties] = useState<Location[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setloading(true);
                let url = '/api/locations?type=city';
                if (selectedCounty) url += `&countyId=${selectedCounty}`;
                if (selectedCountry) url += `&countryId=${selectedCountry}`;

                const response = await fetch(url);
                const data = await response.json();
                setLocations(data);
            } catch (error) {
                console.error('Error fetching locations:', error)
            } finally {
                setloading(false)
;            }
        }

        const fetchCountries = async () => {
            try {
                const response = await fetch('/api/locations?type=country');
                const data = await response.json();
                setCountries(data);
            } catch (error) {
                console.error('Error fetching countries:', error)
            }
        }

        const fetchCounties = async () => {
            try {
                const response = await fetch('/api/locations?type=county');
                const data = await response.json();
                setCounties(data);
            } catch (error) {
                console.error('Error fetching counties:', error)
            }
        }

        fetchLocations();
        fetchCountries();
        fetchCounties();
    }, [selectedCounty, selectedCountry])

    const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleLocationExpand = (id: string) => {
        setExpandedLocation(prev => prev === id ? null : id)
    }

    const handleDeleteLocation = async (id: string) => {
        try {
            const response = await fetch(`/api/locations?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setLocations(prevLocations => prevLocations.filter(location => location.id !== id))
                toast.success("Successfully deleted location!")
            } else {
                toast.error("Failed to delete location!")
                console.error('Failed to delete location')
            }
        } catch (error) {
            toast.error("Error deleting location!")
            console.error('Error deleting location:', error)
        }
    }

    const handleDeleteAll = async () => {
        try {
            filteredLocations.map(async (location) => {
                const response = await fetch(`/api/locations?id=${location.id}`, {
                    method: 'DELETE',
                })
                if (response.ok) {
                    setLocations(prevLocations => prevLocations.filter(locations => locations.id !== location.id))
                    toast.success("Successfully deleted location!")
                } else {
                    toast.error("Failed to delete location!")
                    console.error('Failed to delete location')
                }
            })

        } catch (error) {
            toast.error("Error deleting location!")
            console.error('Error deleting locations:', error)
        }
    }

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
                                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <Input 
                                        type="text" 
                                        id="simple-search" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Search products" 
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <Button type="button" onClick={() => router.push('/locations/new')} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-800">
                                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
                                </svg>
                                Add Location
                            </Button>
                             <Select onValueChange={setSelectedCountry}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Select onValueChange={setSelectedCounty}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by County" />
                                </SelectTrigger>
                                <SelectContent>
                                    {counties.map((county) => (
                                        <SelectItem key={county.id} value={county.id}>
                                            {county.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={handleDeleteAll} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-800">
                                Delete All Locations
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
                        {filteredLocations.map((location) => (
                            <motion.div
                                key={location.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                            <MapPin className="mr-3 text-gray-500" />
                                            {location.name}
                                        </h2>
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/locations/edit/${location.id}`}
                                                className="text-gray-500 hover:text-primary-600 transition"
                                            >
                                                <Edit2 size={20} />
                                            </Link>
                                            <Button
                                                onClick={() =>
                                                    handleDeleteLocation(location.id)
                                                }
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    toggleLocationExpand(location.id)
                                                }
                                                variant="ghost"
                                                className={`text-gray-500 hover:text-primary-600 transition transform ${
                                                    expandedLocation === location.id
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                            >
                                                <ChevronDown size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedLocation === location.id && (
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
                                                        Shipping Cost: {location.shippingCost}
                                                    </p>
                                                      <p className="text-sm text-gray-400 italic">
                                                      {location.county && (
                                                        <span>County: {location.county.name}</span>
                                                      )}
                                                    </p>
                                                      <p className="text-sm text-gray-400 italic">
                                                      {location.country && (
                                                          <span>Country: {location.country.name}</span>
                                                      )}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                {filteredLocations.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No locations...
                    </div>
                )}
            </>
        )}
    </div>
</div>


    )
}

export default LocationPage