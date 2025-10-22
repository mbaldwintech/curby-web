'use client';

import { AdminPageContainer } from '@core/components';
import { PrivacyPolicyService } from '@core/services';
import { PrivacyPolicy } from '@core/types';
import { PrivacyPolicyAcceptanceTable } from '@features/legal/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './page.module.css';

export default function PrivacyPolicyPage() {
  const privacyPolicyService = useRef(createClientService(PrivacyPolicyService)).current;
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    privacyPolicyService
      .getCurrent()
      .then((policy) => {
        setPolicy(policy);
      })
      .catch(() => {
        setPolicy(null);
        setError('Failed to load Privacy Policy. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [privacyPolicyService]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Loading Privacy Policy...</p>
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

  if (!policy) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Privacy Policy content is not available.</p>
      </main>
    );
  }

  return (
    <AdminPageContainer title="Current Privacy Policy">
      <div className="mx-auto w-full max-w-3xl border rounded-md border-border bg-popover p-6 shadow-sm">
        <div className="crby-markdown prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown>
            {policy?.content.replaceAll(/\\n/g, '\n') || 'Privacy Policy content is not available.'}
          </ReactMarkdown>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Version {policy.version} – Effective {new Date(policy.effectiveDate).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <PrivacyPolicyAcceptanceTable
          ToolbarLeft={({ children }) => (
            <>
              <h2 className="text-2xl font-bold">Privacy Policy Acceptances</h2>
              {children}
            </>
          )}
          height={300}
        />
      </div>
    </AdminPageContainer>
  );
}
