'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Registration = {
  id: string;
  title: string;
  date: string;
  summary: string;
  participants: string[];
};

const RegisterPage = () => {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch Registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/registrations${selectedCategory ? `?category=${selectedCategory}` : ''}`);
        const data = await response.json();
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };

  if (loading) {
    return <div>Loading registrations...</div>;
  }

  return (
    <section className="py-8">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="text-xl font-semibold mb-4">Registrations</h2>

        <Dialog>
          <DialogTrigger className="mb-4 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Filter by Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Registrations</DialogTitle>
            </DialogHeader>
            <Select onValueChange={handleCategoryChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{reg.title}</h3>
              <p className="text-sm text-gray-500">{new Date(reg.date).toLocaleDateString()}</p>
              <p className="mt-2">{reg.summary}</p>
              <button
                onClick={() => router.push(`/registrations/${reg.id}`)}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
