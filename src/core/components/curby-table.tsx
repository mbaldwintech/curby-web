'use client';

import { useDebounce } from '@common/hooks';
import { cn } from '@core/utils';
import { BaseService, Filter, Filters, OrderBy, Pagination } from '@supa/services';
import { GenericRecord } from '@supa/types';
import { IconDotsVertical } from '@tabler/icons-react';
import { CellContext, ColumnDefTemplate, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from './button';
import { CustomColumnDef, DataTable } from './data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';

const convertToFilters = <T,>(filters: Filters<T>): ColumnFiltersState =>
  filters.map((f) => ({
    id: (f as { column: keyof T }).column as string,
    value: (f as { value: T[keyof T] }).value
  }));

const convertFromFilter = <T,>(filter: { id: string; value: unknown }): Filter<T> => {
  return {
    column: filter.id as keyof T,
    operator: 'eq',
    value: filter.value as T[keyof T]
  } as Filter<T>;
};

const convertFromFilters = <T,>(filters: ColumnFiltersState): Filters<T> => filters.map((f) => convertFromFilter<T>(f));

const convertToSort = <T,>(sort: OrderBy<T>): SortingState => [{ id: sort.column as string, desc: !sort.ascending }];

const convertFromSort = <T,>(sort: SortingState): OrderBy<T> | null => {
  if (sort.length > 0) {
    const s = sort[0];
    return { column: s.id as keyof T, ascending: !s.desc };
  }
  return null;
};

export interface CurbyTableRowAction<T extends GenericRecord> {
  label: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  getDisabled?: (item: T) => boolean;
  onClick: (row: GenericRecord) => void;
}

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
        return service.count({ column: key, operator: 'ilike', value: `%${query}%` } as Filter<T>);
      },
      fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
        const items = await service.getAllPaged(
          query ? ({ column: key, operator: 'ilike', value: `%${query}%` } as Filter<T>) : undefined,
          { column: key, ascending: true },
          { pageIndex, pageSize }
        );
        return items.reduce(
          (acc, item) => {
            if (!item[key] || acc.some((i) => i.id === item[key])) {
              return acc;
            }
            acc.push({ id: item[key] as string, label: item[key] as string });
            return acc;
          },
          [] as { id: string; label: string }[]
        );
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

export const CurbyTable = <T extends GenericRecord>({
  service,
  columns,
  height,
  maxHeight,
  onRowClick,
  rowActionSections,
  toolbarLeft,
  toolbarRight
}: {
  service: BaseService<T>;
  columns: CustomColumnDef<T>[];
  height?: string | number;
  maxHeight?: string | number;
  onRowClick?: (row: T) => void;
  rowActionSections?: CurbyTableRowAction<T>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}) => {
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
      const count = await service.count(debouncedFilters, {
        text: debouncedSearchText,
        columns: searchableColumns
      });
      setCount(count);
    } catch (error) {
      console.error('Error fetching event count:', error);
      setError('Failed to load event count.');
      setCount(0);
    }
  }, [service, debouncedFilters, debouncedSearchText, searchableColumns]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const getData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllPaged(debouncedFilters, sort, pagination, {
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
  }, [service, debouncedFilters, sort, pagination, debouncedSearchText, searchableColumns]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <DataTable
      columns={columns}
      data={data}
      refresh={getData}
      actions={
        rowActionSections && rowActionSections.length > 0 && rowActionSections?.some((s) => s.length > 0)
          ? (row) => {
              const item = data.find((d) => d.id === row.id);
              if (!item) {
                return null;
              }
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                      size="icon"
                      disabled={loading}
                    >
                      <IconDotsVertical />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-w-60">
                    {rowActionSections?.map((section, i) => (
                      <>
                        {section.map((action, j) => (
                          <DropdownMenuItem
                            key={`action-${i}-${j}`}
                            className={cn(
                              action.variant === 'destructive' ? 'text-destructive' : '',
                              'whitespace-nowrap'
                            )}
                            disabled={action.getDisabled?.(item) || loading}
                            onClick={() => {
                              if (data.length === 1) {
                                action.onClick(data[0]);
                              }
                            }}
                          >
                            {action.icon && (
                              <span className="mr-2 flex h-4 w-4 items-center justify-center">{action.icon}</span>
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                        {i < rowActionSections.length - 1 && <DropdownMenuSeparator />}
                      </>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
          : undefined
      }
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      pageCount={pageCount}
      filters={convertToFilters(filters)}
      onFiltersChange={(newFilters) => {
        const newValue = convertFromFilters(
          typeof newFilters === 'function' ? newFilters(convertToFilters(filters)) : newFilters
        );
        setFilters(newValue);
      }}
      sort={convertToSort(sort)}
      onSortChange={(newSorting) => {
        const newValue = convertFromSort(
          typeof newSorting === 'function' ? newSorting(convertToSort(sort)) : newSorting
        );
        setSort(newValue || { column: 'createdAt', ascending: false });
      }}
      pagination={pagination}
      onPaginationChange={setPagination}
      manualSearch={true}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      loading={loading}
      error={error}
      height={height}
      maxHeight={maxHeight}
      onRowClick={(e) => {
        const rowData = data.find((d) => d.id === e.id);
        if (rowData) {
          onRowClick?.(rowData);
        }
      }}
      toolbarLeft={toolbarLeft}
      toolbarRight={toolbarRight}
    />
  );
};
