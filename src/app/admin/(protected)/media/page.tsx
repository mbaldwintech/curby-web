'use client';

import { Badge, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { CopyableStringCell } from '@core/components/copyable-string-cell';
import { FileExistsCell } from '@core/components/file-exists-cell';
import { MediaService } from '@core/services';
import { Media } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function MediaPage() {
  const router = useRouter();
  const service = useRef(createClientService(MediaService)).current;

  const buildColumn = useCallback(
    <K extends keyof Media>(key: K, header: string, options?: Partial<CustomColumnDef<Media, Media[K]>>) => {
      return buildColumnDef<Media, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Media>[] = useMemo(
    () => [
      buildColumn('filename', 'File Name'),
      buildColumn('fileExtension', 'Extension'),
      buildColumn('mimeType', 'Media Type', {
        cell: ({ row }) =>
          row.original.mimeType && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.mimeType}
              </Badge>
            </div>
          )
      }),
      buildColumn('filePath', 'Path', {
        cell: ({ row }) => <CopyableStringCell value={row.original.filePath} className="w-50" />
      }),
      buildColumn('url', 'URL', {
        cell: ({ row }) => <CopyableStringCell value={row.original.url} className="w-50" />
      }),
      {
        accessorKey: 'fileExists',
        header: 'File Exists',
        cell: ({ row }) => <FileExistsCell path={row.original.filePath} />,
        enableSorting: false,
        enableColumnFilter: false,
        enableSearching: false
      }
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Media" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(media) => {
            router.push(`/admin/media/${media.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (media) => {
                  router.push(`/admin/media/${media.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
