'use client';

import { Badge, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { TutorialService } from '@core/services';
import { Tutorial } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function TutorialsPage() {
  const router = useRouter();
  const service = useRef(createClientService(TutorialService)).current;

  const buildColumn = useCallback(
    <K extends keyof Tutorial>(key: K, header: string, options?: Partial<CustomColumnDef<Tutorial, Tutorial[K]>>) => {
      return buildColumnDef<Tutorial, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Tutorial>[] = useMemo(
    () => [
      buildColumn('key', 'Event Key', { enableHiding: false }),
      buildColumn('title', 'Title'),
      buildColumn('description', 'Description'),
      buildColumn('roles', 'Roles', {
        cell: ({ row }) =>
          row.original.roles.length > 0 && (
            <div className="w-32">
              {row.original.roles.map((role, idx) => (
                <Badge key={role + '_' + idx} variant="outline" className="text-muted-foreground px-1.5">
                  {role}
                </Badge>
              ))}
            </div>
          )
      }),
      buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Tutorials" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(template) => {
            router.push(`/admin/tutorials/${template.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (template) => {
                  router.push(`/admin/tutorials/${template.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
