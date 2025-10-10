'use client';

import { AdminHeader, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { ProfileCell } from '@core/components/profile-cell';
import { PrivacyPolicyAcceptanceService, PrivacyPolicyService } from '@core/services';
import { PrivacyPolicy, PrivacyPolicyAcceptance } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './page.module.css';

export default function PrivacyPolicyPage() {
  const privacyPolicyService = useRef(createClientService(PrivacyPolicyService)).current;
  const privacyPolicyAcceptanceService = useRef(createClientService(PrivacyPolicyAcceptanceService)).current;
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildColumn = useCallback(
    <K extends keyof PrivacyPolicyAcceptance>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<PrivacyPolicyAcceptance, PrivacyPolicyAcceptance[K]>>
    ) => {
      return buildColumnDef<PrivacyPolicyAcceptance, K>(key, header, privacyPolicyAcceptanceService, options);
    },
    [privacyPolicyAcceptanceService]
  );

  const columns: CustomColumnDef<PrivacyPolicyAcceptance>[] = useMemo(
    () => [
      buildColumn('userId', 'User', {
        enableHiding: false,
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('acceptedAt', 'Accepted At', {
        cell: ({ row }) => new Date(row.original.acceptedAt).toLocaleString(),
        sortingFn: 'datetime',
        enableHiding: false
      })
    ],
    [buildColumn]
  );

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
    <>
      <AdminHeader title="Current Privacy Policy" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
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
          <CurbyTable
            toolbarLeft={<h2 className="text-2xl font-bold">Privacy Policy Acceptances</h2>}
            columns={columns}
            service={privacyPolicyAcceptanceService}
            height={300}
          />
        </div>
      </div>
    </>
  );
}
