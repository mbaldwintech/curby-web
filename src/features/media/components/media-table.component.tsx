'use client';

import {
  Badge,
  buildColumnDef,
  CopyableStringCell,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { MediaService } from '@core/services';
import { Media } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FileExistsBadge } from './file-exists-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MediaTableProps extends Omit<CurbyTableProps<Media>, 'service' | 'columns'> {}

export const MediaTable = forwardRef<CurbyTableRef<Media>, MediaTableProps>(function MediaTable(
  props: MediaTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(MediaService)).current;

  const buildColumn = useCallback(
    <K extends keyof Media>(key: K, header: string, options?: Partial<CustomColumnDef<Media, Media[K]>>) => {
      return buildColumnDef<Media, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Media>[] = useMemo(
    () =>
      [
        buildColumn('filename', 'File Name'),
        buildColumn('fileExtension', 'Extension'),
        buildColumn('mimeType', 'Media Type', {
          cell: ({ row }) => row.original.mimeType && <Badge variant="outline">{row.original.mimeType}</Badge>
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
          cell: ({ row }: { row: Row<Media> }) => <FileExistsBadge path={row.original.filePath} />,
          enableSorting: false,
          enableColumnFilter: false,
          enableSearching: false
        }
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
