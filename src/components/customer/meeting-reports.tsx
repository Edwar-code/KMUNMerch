'use client';

import React, { useEffect, useState } from 'react';

interface MeetingReport {
  id: string;
  title: string;
  pdfUrl: string;  // URL to the PDF file (hosted or cloud)
  createdAt: string;
}

export const MeetingReports: React.FC = () => {
  const [reports, setReports] = useState<MeetingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/meeting-reports');
        if (!res.ok) throw new Error('Failed to fetch meeting reports');

        const data: MeetingReport[] = await res.json();
        setReports(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) return <p>Loading meeting reports...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  if (reports.length === 0) return <p>No meeting reports found.</p>;

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Meeting Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{report.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Date: {new Date(report.createdAt).toLocaleDateString()}</p>
            <div className="flex space-x-4">
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View PDF
              </a>
              <a
                href={report.pdfUrl}
                download
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MeetingReports;
