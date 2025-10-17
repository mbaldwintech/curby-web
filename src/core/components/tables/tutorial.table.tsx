'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TutorialService } from '../../services';
import { Tutorial } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface TutorialTableProps extends Omit<CurbyTableProps<Tutorial>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Tutorial>[];
}

export const TutorialTable = forwardRef<CurbyTableRef<Tutorial>, TutorialTableProps>(function TutorialTable(
  props: TutorialTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
  const service = useRef(createClientService(TutorialService)).current;

  const buildColumn = useCallback(
    <K extends keyof Tutorial>(key: K, header: string, options?: Partial<CustomColumnDef<Tutorial, Tutorial[K]>>) => {
      return buildColumnDef<Tutorial, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Tutorial>[] = useMemo(
    () => [
      buildColumn('key', 'Event Key', { enableHiding: false, size: 200 }),
      buildColumn('title', 'Title'),
      buildColumn('description', 'Description'),
      buildColumn('roles', 'Roles', {
        cell: ({ row }) =>
          row.original.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-48">
              {row.original.roles.map((role, idx) => (
                <Badge key={role + '_' + idx} variant="outline" className="text-xs px-2 py-1 whitespace-nowrap">
                  {role}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No roles</span>
          )
      }),
      buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
