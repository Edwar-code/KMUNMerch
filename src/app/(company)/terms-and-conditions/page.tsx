'use client'
import React, { useEffect, useState } from 'react';

interface Policy {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const TermsAndConditionsPage = () => {
  const [termsPolicy, setTermsPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    const fetchTermsPolicy = async () => {
      try {
        const termsResponse = await fetch('/api/policies?type=terms');
        if (!termsResponse.ok) {
          throw new Error(`HTTP error! status: ${termsResponse.status}`);
        }
        const termsData = await termsResponse.json();
        setTermsPolicy(termsData[0] || null);
      } catch (error) {
        console.error('Error fetching terms of service:', error);
      }
    };

    fetchTermsPolicy();
  }, []);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
          <h1 className="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">
            Terms and Conditions
          </h1>

          <section className="mb-8">
            {termsPolicy ? (
              <>
                <div className="mb-4">
                  <p className="font-light">
                    <strong>Last Updated:</strong> {formatDate(termsPolicy.updatedAt)}
                  </p>
                  <p className="font-light">
                    <strong>Created At:</strong> {formatDate(termsPolicy.createdAt)}
                  </p>
                </div>
                <div className="terms-content" dangerouslySetInnerHTML={{ __html: termsPolicy.content }} />
              </>
            ) : (
              <p>Terms and Conditions content not found.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditionsPage;