'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRole } from '@prisma/client';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  number: number;
  street: string | null;
  countryId: string | null;
  countyId: string | null;
  cityId: string | null;
  createdAt: string;
  updatedAt: string;
  countryName?: string;
  countyName?: string;
  cityName?: string;
}

type Location = {
  id: string;
  name: string;
}

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);
  const { data: session } = useSession();
  const [countries, setCountries] = useState<Location[]>([]);
  const [counties, setCounties] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [filterCountry, setFilterCountry] = useState<string | undefined>(undefined);
  const [filterCounty, setFilterCounty] = useState<string | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);
  const [filterRole, setFilterRole] = useState<UserRole | undefined>(undefined);

  // States for available Counties and Cities based on selected Country/County
  const [availableCounties, setAvailableCounties] = useState<Location[]>([]);
  const [availableCities, setAvailableCities] = useState<Location[]>([]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to retrieve user data. Please try again later.');
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  const fetchLocationNames = useCallback(async () => {
    try {
      // Fetch all countries, counties and cities
      const countriesResponse = await fetch('/api/locations?type=country&limit=100');
      const countiesResponse = await fetch('/api/locations?type=county&limit=100');
      const citiesResponse = await fetch('/api/locations?type=city&limit=100');

      if (!countriesResponse.ok || !countiesResponse.ok || !citiesResponse.ok) {
        throw new Error('Failed to fetch locations');
      }

      const countriesData = await countriesResponse.json();
      const countiesData = await countiesResponse.json();
      const citiesData = await citiesResponse.json();

      setCountries(countriesData);
      setCounties(countiesData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to retrieve location data. Please try again later.');
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    fetchLocationNames();
  }, [fetchUsers, fetchLocationNames]);

  // Update Available Counties when Country Changes
  useEffect(() => {
    if (filterCountry) {
      const filteredCounties = counties.filter(county => {
        const usersInCountry = users.filter(user => user.countryId === filterCountry)
        return usersInCountry.some(user => user.countyId === county.id)
      });
      setAvailableCounties(filteredCounties);
      // Reset county and city filters when country changes
      setFilterCounty(undefined);
      setFilterCity(undefined);
      setAvailableCities([])
    } else {
      setAvailableCounties(counties);
      setFilterCounty(undefined);
      setFilterCity(undefined);
      setAvailableCities([])
    }
  }, [filterCountry, counties, users]);

  // Update Available Cities when County Changes
  useEffect(() => {
    if (filterCounty) {
      const filteredCities = cities.filter(city => {
          const usersInCounty = users.filter(user => user.countyId === filterCounty)
          return usersInCounty.some(user => user.cityId === city.id)
      });
      setAvailableCities(filteredCities);
      // Reset city filter when county changes
      setFilterCity(undefined);
    } else {
      setAvailableCities(cities);
      setFilterCity(undefined);
    }
  }, [filterCounty, cities, users]);

  useEffect(() => {
    // Function to resolve location names
    const resolveLocationNames = (user: User): User => {
      const country = countries.find((c) => c.id === user.countryId);
      const county = counties.find((c) => c.id === user.countyId);
      const city = cities.find((c) => c.id === user.cityId);

      return {
        ...user,
        countryName: country ? country.name : 'N/A',
        countyName: county ? county.name : 'N/A',
        cityName: city ? city.name : 'N/A',
      };
    };

    // Resolve location names for all users
    const usersWithLocationNames = users.map(resolveLocationNames);

    // Apply filters
    let filtered = usersWithLocationNames;

    if (filterCountry) {
      filtered = filtered.filter(user => user.countryId === filterCountry);
    }
    if (filterCounty) {
      filtered = filtered.filter(user => user.countyId === filterCounty);
    }
    if (filterCity) {
      filtered = filtered.filter(user => user.cityId === filterCity);
    }
    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);

  }, [users, countries, counties, cities, filterCountry, filterCounty, filterCity, filterRole]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (session?.user?.id === userId) {
      toast.error("You cannot change your own role.", {
        description: "Unauthorized",
      })
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users?id=${userId}`, { // Use query parameter
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const updatedUser = await response.json();

      // Update local user state after the role change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        )
      );
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        )
      );
      toast.success("User role updated successfully.", {
        description: "Success",
      })
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update user role.", {
        description: "Error",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (session?.user?.id === userId) {
      toast.error("You cannot delete your own account.", {
        description: "Unauthorized",
      });
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, { // Use query parameter
        method: 'DELETE',
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setFilteredUsers((prevFilteredUsers) => prevFilteredUsers.filter((user) => user.id !== userId));
        toast.success("User deleted successfully.", {
          description: "Success",
        })
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user.", {
        description: "Error",
      })
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(query))
      );
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "number",
      header: "Number",
    },
    {
      accessorKey: "street", // Accessor key for the street
      header: "Street",
    },
    {
      accessorKey: "cityName",
      header: "City",
    },
    {
      accessorKey: "countyName",
      header: "County",
    },
    {
      accessorKey: "countryName",
      header: "Country",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Select
            defaultValue={user.role}
            onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
            disabled={loading || session?.user?.id === user.id}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={session?.user?.id === user.id}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Are you sure you want to delete {user.name}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
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
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Search by email"
                    value={searchQuery}
                    onChange={handleSearch}
                    required
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Select onValueChange={(value) => setFilterCountry(value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => setFilterCounty(value === 'all' ? undefined : value)}
                disabled={!filterCountry} // Disable if no country is selected
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by County" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {availableCounties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>{county.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => setFilterCity(value === 'all' ? undefined : value)}
                disabled={!filterCounty} // Disable if no county is selected
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilterRole(value === 'all' ? undefined : value as UserRole)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  Array(5) // Display 5 loading rows
                    .fill(null)
                    .map((_, i) => (
                      <TableRow key={`loading-${i}`}>
                        <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 h-4"></div>
                        </TableCell>
                        <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 h-4"></div>
                        </TableCell>
                        <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 h-4"></div>
                        </TableCell>
                         <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 h-4"></div>
                        </TableCell>
                         <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 h-4"></div>
                        </TableCell>
                         <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 h-4"></div>
                        </TableCell>
                        <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-2/3 h-8"></div>
                        </TableCell>
                        <TableCell className="h-12 p-4 font-medium">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-1/4 h-8"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserPage;