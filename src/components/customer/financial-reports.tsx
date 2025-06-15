'use client';

import React, { useEffect, useState } from 'react';

interface FinancialReport {
  id: string;
  title: string;
  pdfUrl: string;
  createdAt: string;
}

export const FinancialReports: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/financial-reports');
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching financial reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <p>Loading financial reports...</p>;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Financial Reports</h2>
      <ul className="space-y-4">
        {reports.map((report) => (
          <li key={report.id} className="border p-4 rounded shadow-sm">
            <h3 className="text-lg font-medium">{report.title}</h3>
            <p className="text-sm text-gray-600">Uploaded on: {new Date(report.createdAt).toLocaleDateString()}</p>
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 hover:underline"
              download
            >
              View / Download PDF
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
