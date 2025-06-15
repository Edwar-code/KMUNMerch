'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function EditReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    reporterName: '',
    isResolved: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports?id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        const data = await res.json();
        setForm({
          title: data.title || '',
          description: data.description || '',
          reporterName: data.reporterName || '',
          isResolved: data.isResolved || false,
        });
      } catch (error) {
        toast.error('Failed to load report');
      }
    };
    if (id) fetchReport();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, isResolved: !prev.isResolved }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update report');

      toast.success('Report updated!');
      router.push('/reports');
    } catch (err) {
      toast.error('Error updating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input name="title" id="title" value={form.title} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" id="description" value={form.description} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="reporterName">Reporter Name</Label>
              <Input name="reporterName" id="reporterName" value={form.reporterName} onChange={handleChange} required />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isResolved" checked={form.isResolved} onCheckedChange={handleToggle} />
              <Label htmlFor="isResolved">Mark as Resolved</Label>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
