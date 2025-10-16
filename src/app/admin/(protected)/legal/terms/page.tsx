'use client';

import { AdminPageContainer, TermsAndConditionsAcceptanceTable } from '@core/components';
import { TermsAndConditionsService } from '@core/services';
import { TermsAndConditions } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './page.module.css';

export default function TermsAndConditionsPage() {
  const termsAndConditionsService = useRef(createClientService(TermsAndConditionsService)).current;
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    termsAndConditionsService
      .getCurrent()
      .then((terms) => {
        setTerms(terms);
      })
      .catch(() => {
        setTerms(null);
        setError('Failed to load Terms & Conditions. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [termsAndConditionsService]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Loading Terms & Conditions...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!terms) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Terms & Conditions content is not available.</p>
      </main>
    );
  }

  return (
    <AdminPageContainer title="Current Terms & Conditions">
      <div className="mx-auto w-full max-w-3xl border rounded-md border-border bg-popover p-6 shadow-sm">
        <div className="crby-markdown prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown>
            {terms?.content.replaceAll(/\\n/g, '\n') || 'Terms & Conditions content is not available.'}
          </ReactMarkdown>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Version {terms.version} – Effective {new Date(terms.effectiveDate).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <TermsAndConditionsAcceptanceTable
          toolbarLeft={<h2 className="text-2xl font-bold">Terms & Conditions Acceptances</h2>}
          height={300}
        />
      </div>
    </AdminPageContainer>
  );
}
