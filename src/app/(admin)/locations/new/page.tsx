'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState, useEffect } from 'react';
import { LocationType } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const CreateLocationPage = () => {
    const [names, setNames] = useState(''); // Comma-separated names
    const [type, setType] = useState<LocationType>('country');
    const [shippingCost, setShippingCost] = useState<number | undefined>(undefined);
    const [countryId, setCountryId] = useState<string | undefined>(undefined);
    const [countyId, setCountyId] = useState<string | undefined>(undefined);
    const [cityId, setCityId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [countries, setCountries] = useState<{ id: string; name: string; }[]>([]);
    const [counties, setCounties] = useState<{ id: string; name: string; }[]>([]);
    const [cities, setCities] = useState<{ id: string; name: string; }[]>([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('/api/locations?type=country');
                const data = await response.json();
                setCountries(data.map((c: any) => ({ id: c.id, name: c.name })));
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchCounties = async () => {
            if (!countryId) return;
            try {
                const response = await fetch(`/api/locations?type=county&countryId=${countryId}`);
                const data = await response.json();
                setCounties(data.map((c: any) => ({ id: c.id, name: c.name })));
            } catch (error) {
                console.error('Failed to fetch counties:', error);
            }
        };

        fetchCounties();
    }, [countryId]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!countyId) return;
            try {
                const response = await fetch(`/api/locations?type=city&countyId=${countyId}`);
                const data = await response.json();
                setCities(data.map((c: any) => ({ id: c.id, name: c.name })));
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };

        fetchCities();
    }, [countyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const namesArray = names.split(',').map(name => name.trim()).filter(name => name !== '');

        if (namesArray.length === 0) {
            toast.error('Please enter at least one location name.');
            setLoading(false);
            return;
        }

        try {
            await Promise.all(namesArray.map(async name => {
                const payload = {
                    name,
                    type,
                    shippingCost: shippingCost === undefined ? 0 : shippingCost,
                    countryId: countryId || undefined,
                    countyId: countyId || undefined,
                    cityId: cityId || undefined,
                };

                const response = await fetch('/api/locations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to create location: ${name}`);
                }
            }));


            toast.success('Locations created successfully!');
            router.push('/locations'); // Redirect after successful creation
        } catch (error: any) {
            toast.error(`Failed to create locations. Check console for details. First error: ${error.message}`);
            console.error('Error creating locations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
            <Card className="w-[550px] bg-white shadow-md rounded-md dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create New Location(s)</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Add new locations to the system.  Separate multiple names with commas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div>
                            <Label htmlFor="name">Name(s) (Comma Separated)</Label>
                            <Input
                                type="text"
                                id="name"
                                value={names}
                                onChange={(e) => setNames(e.target.value)}
                                placeholder="Location Name(s), e.g., New York, Los Angeles"
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={type} onValueChange={(value: LocationType) => setType(value)}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="country">Country</SelectItem>
                                    <SelectItem value="county">County</SelectItem>
                                    <SelectItem value="city">City</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type !== 'country' && (
                            <div>
                                <Label htmlFor="countryId">Country</Label>
                                <Select value={countryId} onValueChange={(value) => { setCountryId(value); setCounties([]); setCountyId(undefined); setCities([]); setCityId(undefined); }}>
                                    <SelectTrigger className="w-full mt-1" >
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
                        )}

                        {type === 'city' && countryId && (
                            <div>
                                <Label htmlFor="countyId">County</Label>
                                <Select value={countyId} onValueChange={(value) => {setCountyId(value); setCities([]); setCityId(undefined);}}>
                                    <SelectTrigger className="w-full mt-1">
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
                        )}

                        <div>
                            <Label htmlFor="shippingCost">Shipping Cost</Label>
                            <Input
                                type="number"
                                id="shippingCost"
                                value={shippingCost === undefined ? '' : shippingCost}
                                onChange={(e) => setShippingCost(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                placeholder="0.00"
                                className="mt-1"
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button disabled={loading} onClick={handleSubmit}>
                        {loading ? (
                            <>
                                Adding... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            </>
                        ) : (
                            'Create Location(s)'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </section>
    );
};

export default CreateLocationPage;