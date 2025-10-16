'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { EventTypeService } from '../../services';
import { EventType } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface EventTypeTableProps {
  defaultFilters?: Filters<EventType>;
  onRowClick?: (eventType: EventType) => void;
  rowActionSections?: CurbyTableRowAction<EventType>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<EventType>[];
}

export const EventTypeTable = forwardRef<CurbyTableRef<EventType>, EventTypeTableProps>(function EventTypeTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: EventTypeTableProps,
  ref
) {
  const service = useRef(createClientService(EventTypeService)).current;

  const buildColumn = useCallback(
    <K extends keyof EventType>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<EventType, EventType[K]>>
    ) => {
      return buildColumnDef<EventType, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<EventType>[] = useMemo(
    () => [
      buildColumn('key', 'Event Key', { enableHiding: false }),
      buildColumn('name', 'Name'),
      buildColumn('category', 'Category'),
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
