'use client'
import React, { useEffect, useState } from 'react';

interface Policy {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrivacyPoliciesPage = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setIsLoading(true); 
      try {
        const privacyResponse = await fetch('/api/policies?type=privacy');
        if (!privacyResponse.ok) {
          throw new Error(`HTTP error! status: ${privacyResponse.status}`);
        }
        const privacyData = await privacyResponse.json();
        setPrivacyPolicy(privacyData[0] || null);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="mb-4">
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div> {/* Date Skeleton */}
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4"></div> {/* Date Skeleton */}
      </div>
      <div className="policy-content">
        <div className="h-8 bg-muted-foreground/30 rounded w-1/2 mb-4"></div> {/* Heading 1 */}
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-6 bg-muted-foreground/30 rounded w-1/3 mb-2"></div> {/* Heading 2/3 */}
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 bg-muted-foreground/30 rounded w-full mb-2"></div> /* Paragraph */
            ))}
          </div>
        ))}
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div>
      </div>
    </div>
  );

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
          <h1 className="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>

          <section className="mb-8">
            {isLoading ? (
              <Skeleton />
            ) : privacyPolicy ? (
              <>
                <div className="mb-4">
                  <p className="font-light">
                    <strong>Last Updated:</strong> {formatDate(privacyPolicy.updatedAt)}
                  </p>
                  <p className="font-light">
                    <strong>Created At:</strong> {formatDate(privacyPolicy.createdAt)}
                  </p>
                </div>
                <div className="policy-content" dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} />
              </>
            ) : (
              <p>Privacy Policy content not found.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPoliciesPage;