'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TutorialService } from '../../services';
import { Tutorial } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface TutorialTableProps {
  defaultFilters?: Filters<Tutorial>;
  onRowClick?: (tutorial: Tutorial) => void;
  rowActionSections?: CurbyTableRowAction<Tutorial>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<Tutorial>[];
}

export const TutorialTable = forwardRef<CurbyTableRef<Tutorial>, TutorialTableProps>(function TutorialTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: TutorialTableProps,
  ref
) {
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
      buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') }),
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
