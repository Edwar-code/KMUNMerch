'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FinancialReport = {
  id: string;
  title: string;
  date: string;
  summary: string;
  amount: number;
};

const FinancialReportsPage = () => {
  const router = useRouter();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories (if you want to filter financial reports)
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

  // Fetch financial reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/financial-reports${selectedCategory ? `?category=${selectedCategory}` : ''}`);
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching financial reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading financial reports...</div>;
  }

  return (
    <section className="py-8">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="text-xl font-semibold mb-4">📊 Financial Reports</h2>

        <Dialog>
          <DialogTrigger className="mb-4 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Filter by Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Reports</DialogTitle>
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
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{report.title}</h3>
              <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
              <p className="mt-1 text-sm text-gray-600">Amount: KES {report.amount.toLocaleString()}</p>
              <p className="mt-2 text-gray-700">{report.summary}</p>
              <button
                onClick={() => router.push(`/financial-reports/${report.id}`)}
                className="mt-4 inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialReportsPage;
