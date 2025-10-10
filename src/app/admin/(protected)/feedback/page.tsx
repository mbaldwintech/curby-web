'use client';

import { Badge, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { ProfileCell } from '@core/components/profile-cell';
import { FeedbackService } from '@core/services';
import { Feedback } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function FeedbackPage() {
  const router = useRouter();
  const service = useRef(createClientService(FeedbackService)).current;

  const buildColumn = useCallback(
    <K extends keyof Feedback>(key: K, header: string, options?: Partial<CustomColumnDef<Feedback, Feedback[K]>>) => {
      return buildColumnDef<Feedback, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Feedback>[] = useMemo(
    () => [
      buildColumn('userId', 'User', { cell: ({ row }) => <ProfileCell userId={row.original.userId} /> }),
      buildColumn('type', 'Type', {
        cell: ({ row }) => (
          <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {row.original.type}
            </Badge>
          </div>
        )
      }),
      buildColumn('message', 'Message', { cell: ({ row }) => <div className="max-w-lg">{row.original.message}</div> }),
      buildColumn('resolved', 'Resolved')
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Feedback" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(feedback) => {
            router.push(`/admin/feedback/${feedback.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (feedback) => {
                  router.push(`/admin/feedback/${feedback.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
