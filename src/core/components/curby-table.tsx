'use client';

import { BaseService, Filter, Filters, OrderBy, Pagination } from '@supa/services';
import { GenericRecord } from '@supa/types';
import { CellContext, ColumnDefTemplate, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useDebounce } from '../hooks';
import { CustomColumnDef, DataTable, DataTableProps, DataTableRef, RowMenuItem } from './base';

const convertToFilters = <T,>(filters: Filters<T>): ColumnFiltersState =>
  filters.map((f) => ({
    id: (f as { column: keyof T }).column as string,
    value: (f as { value: T[keyof T] }).value
  }));

const convertFromFilters = <T,>(filters: ColumnFiltersState): Filters<T> =>
  filters.map(({ id, value }): Filter<T> => {
    return {
      column: id as keyof T,
      operator: 'eq',
      value: value as T[keyof T]
    } as Filter<T>;
  });

const convertToSort = <T,>(sort: OrderBy<T>): SortingState => [{ id: sort.column as string, desc: !sort.ascending }];

const convertFromSort = <T,>(sort: SortingState): OrderBy<T> | null => {
  if (sort.length > 0) {
    const s = sort[0];
    return { column: s.id as keyof T, ascending: !s.desc };
  }
  return null;
};

export const buildColumnDef = <T extends GenericRecord, K extends keyof T & string>(
  key: K,
  header: CustomColumnDef<T>['header'],
  service: BaseService<T>,
  columnDef?: Partial<CustomColumnDef<T, T[K]>>
): CustomColumnDef<T> => {
  let def: CustomColumnDef<T> = {
    ...((columnDef ?? {}) as CustomColumnDef<T>),
    accessorKey: key,
    header,
    cell: (columnDef && columnDef.cell ? columnDef.cell : ({ row }) => row.original[key]) as
      | ColumnDefTemplate<CellContext<T, unknown>>
      | undefined,
    enableHiding: columnDef?.enableHiding ?? true,
    enableSearching: columnDef?.enableSearching ?? true,
    filterComponent: 'paged-autocomplete',
    filterComponentOptions: {
      getCount: async (query: string) => {
        return service.count(undefined, { text: query, columns: [key] });
      },
      fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
        const items = await service.getAllPaged(
          undefined,
          { column: key, ascending: true },
          { pageIndex, pageSize },
          { text: query, columns: [key] }
        );
        const res = items.reduce(
          (acc, item) => {
            if (!item[key] || acc.some((i) => i.id === item[key])) {
              return acc;
            }
            acc.push({ id: item[key] as string, label: item[key] as string });
            return acc;
          },
          [] as { id: string; label: string }[]
        );
        return res;
      }
    }
  };

  if (columnDef?.enableColumnFilter !== false) {
    if (columnDef?.filterComponent === 'distinct' && !columnDef.filterComponentOptions) {
      def = {
        ...def,
        filterComponent: 'distinct',
        filterComponentOptions: {
          getOptions: () => service.getDistinctValuesForColumn(key)
        }
      } as CustomColumnDef<T>;
    } else if (
      columnDef?.filterComponent &&
      (typeof columnDef.filterComponent === 'function' ||
        (typeof columnDef.filterComponent === 'string' && columnDef.filterComponentOptions))
    ) {
      def = {
        ...def,
        filterComponent: columnDef.filterComponent,
        filterComponentOptions: columnDef.filterComponentOptions
      } as CustomColumnDef<T>;
    }
  }

  return def;
};

export interface ImplementedCurbyTableProps<T extends GenericRecord>
  extends Omit<CurbyTableProps<T>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<T>[];
}

export interface CurbyTableRef<T extends GenericRecord> extends DataTableRef<T> {
  refresh: () => void;
}

export interface CurbyTableProps1<T extends GenericRecord> {
  getRowActionSections?: (row: T) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
}

export interface CurbyTableProps<T extends GenericRecord>
  extends Omit<
    DataTableProps<T>,
    | 'data'
    | 'refresh'
    | 'manualPagination'
    | 'pageCount'
    | 'pagination'
    | 'onPaginationChange'
    | 'manualSorting'
    | 'sort'
    | 'onSortChange'
    | 'manualFiltering'
    | 'filters'
    | 'onFiltersChange'
    | 'manualSearch'
    | 'searchText'
    | 'onSearchTextChange'
    | 'loading'
    | 'error'
  > {
  service: BaseService<T>;
  defaultFilters?: Filters<T>;
  columns: CustomColumnDef<T>[];
}

function CurbyTableInternal<T extends GenericRecord>(
  { service, defaultFilters, columns, getRowContextMenuItems, getRowActionMenuItems, ...rest }: CurbyTableProps<T>,
  ref: React.Ref<CurbyTableRef<T>>
) {
  const dataTableRef = React.useRef<DataTableRef<T>>(null);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);
  const searchableColumns = useMemo(
    () =>
      columns
        .filter((c) => c.enableSearching)
        .map(<K,>(c: CustomColumnDef<T, K>) => (c as { accessorKey: string }).accessorKey || c.id)
        .filter(Boolean) as (keyof T)[],
    [columns]
  );
  const [filters, setFilters] = useState<Filter<T>[]>([]);
  const memoizedDefaultFilters = useMemo(() => defaultFilters || [], [defaultFilters]);
  const debouncedFilters = useDebounce(filters, 300);
  const [sort, setSort] = useState<OrderBy<T>>({ column: 'createdAt', ascending: false });

  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const [count, setCount] = useState(0);
  const pageCount = useMemo(() => {
    return Math.ceil(count / pagination.pageSize);
  }, [count, pagination.pageSize]);

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      let filters: Filters<T> = [];
      if (memoizedDefaultFilters.length > 0) {
        filters = [...memoizedDefaultFilters];
      }
      if (debouncedFilters.length > 0) {
        filters = [...filters, ...debouncedFilters];
      }
      const count = await service.count(filters, {
        text: debouncedSearchText,
        columns: searchableColumns
      });
      setCount(count);
    } catch (error) {
      console.error('Error fetching event count:', error);
      setError('Failed to load event count.');
      setCount(0);
    }
  }, [service, memoizedDefaultFilters, debouncedFilters, debouncedSearchText, searchableColumns]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const getData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let filters: Filters<T> = [];
      if (memoizedDefaultFilters.length > 0) {
        filters = [...memoizedDefaultFilters];
      }
      if (debouncedFilters.length > 0) {
        filters = [...filters, ...debouncedFilters];
      }
      const data = await service.getAllPaged(filters, sort, pagination, {
        text: debouncedSearchText,
        columns: searchableColumns
      });
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, memoizedDefaultFilters, debouncedFilters, sort, pagination, debouncedSearchText, searchableColumns]);

  useEffect(() => {
    getData();
  }, [getData]);

  useImperativeHandle<CurbyTableRef<T>, CurbyTableRef<T>>(ref, (): CurbyTableRef<T> => {
    return {
      toggleExpand: dataTableRef.current?.toggleExpand ?? (() => {}),
      refresh: getData
    };
  });

  return (
    <DataTable
      ref={dataTableRef}
      data={data}
      columns={columns}
      refresh={getData}
      getRowActionMenuItems={getRowActionMenuItems}
      getRowContextMenuItems={getRowContextMenuItems ?? getRowActionMenuItems}
      // Filtering
      manualFiltering={true}
      filters={convertToFilters(filters)}
      onFiltersChange={(newFilters) => {
        const newValue = convertFromFilters(
          typeof newFilters === 'function' ? newFilters(convertToFilters(filters)) : newFilters
        );
        setFilters(newValue);
      }}
      // Sorting
      manualSorting={true}
      sort={convertToSort(sort)}
      onSortChange={(newSorting) => {
        const newValue = convertFromSort(
          typeof newSorting === 'function' ? newSorting(convertToSort(sort)) : newSorting
        );
        setSort(newValue || { column: 'createdAt', ascending: false });
      }}
      // Pagination
      manualPagination={true}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={setPagination}
      // Search
      manualSearch={true}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      loading={loading}
      error={error}
      {...rest}
    />
  );
}

export const CurbyTable = forwardRef(CurbyTableInternal) as <T extends GenericRecord>(
  props: CurbyTableProps<T> & { ref?: React.Ref<CurbyTableRef<T>> }
) => React.JSX.Element;
