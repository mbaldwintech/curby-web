'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { MediaService } from '../../services';
import { Media } from '../../types';
import { CopyableStringCell, FileExistsCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface MediaTableProps {
  defaultFilters?: Filters<Media>;
  onRowClick?: (media: Media) => void;
  rowActionSections?: CurbyTableRowAction<Media>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<Media>[];
}

export const MediaTable = forwardRef<CurbyTableRef<Media>, MediaTableProps>(function MediaTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: MediaTableProps,
  ref
) {
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

  return (
    <CurbyTable
      ref={ref}
      service={service}
      defaultFilters={defaultFilters}
      columns={columns}
      height={height}
      maxHeight={maxHeight}
      onRowClick={onRowClick}
      rowActionSections={rowActionSections}
      toolbarLeft={toolbarLeft}
      toolbarRight={toolbarRight}
    />
  );
});
