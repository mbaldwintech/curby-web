'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { EventTypeService } from '@core/services';
import { EventType } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventTypeTableProps extends Omit<CurbyTableProps<EventType>, 'service' | 'columns'> {}

export const EventTypeTable = forwardRef<CurbyTableRef<EventType>, EventTypeTableProps>(function EventTypeTable(
  props: EventTypeTableProps,
  ref
) {
  const { ...rest } = props;
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
    () =>
      [
        buildColumn('key', 'Event Key', { enableHiding: false }),
        buildColumn('name', 'Name'),
        buildColumn('category', 'Category')
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
