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
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FileExistsCell } from './file-exists-cell.component';

export interface MediaTableProps extends Omit<CurbyTableProps<Media>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Media>[];
}

export const MediaTable = forwardRef<CurbyTableRef<Media>, MediaTableProps>(function MediaTable(
  props: MediaTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
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
      },
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
