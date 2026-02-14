import {
  ColumnDef,
  ColumnFiltersState,
  ColumnMeta,
  Header,
  HeaderContext,
  PaginationState,
  Row,
  SortingState,
  Updater,
  VisibilityState
} from '@tanstack/react-table';
import React from 'react';

export interface PagedAutocompleteFilterComponentOptions {
  getCount: (query: string) => Promise<number>;
  fetchOptions: (query: string, page: number, pageSize: number) => Promise<{ id: string; label: string }[]>;
  fetchSelectedItem: (id: string) => Promise<{ id: string; label: string } | null>;
  nullable?: boolean;
  nullValueLabel?: string;
}

export interface DistinctFilterComponentOptions<T> {
  getOptions: () => Promise<T[]>;
}

export type FilterComponent<TData, TValue> = (props: HeaderContext<TData, TValue>) => React.JSX.Element;

export type CustomColumnMeta<TData, TValue> = ColumnMeta<TData, TValue> & {
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'left' | 'center' | 'right';
  truncate?: boolean;
  showTooltip?: boolean;
};

export type BaseCustomColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean;
  filterComponent?: FilterComponent<TData, TValue>;
  filterComponentOptions?: never;
  meta?: CustomColumnMeta<TData, TValue>;
  defaultHidden?: boolean;
};

export type PagedAutocompleteColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean;
  filterComponent: 'paged-autocomplete';
  filterComponentOptions: PagedAutocompleteFilterComponentOptions;
  defaultHidden?: boolean;
};

export type DistinctColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean;
  filterComponent: 'distinct';
  filterComponentOptions: DistinctFilterComponentOptions<TValue>;
  defaultHidden?: boolean;
};

export type CustomColumnDef<TData, TValue = unknown> =
  | BaseCustomColumnDef<TData, TValue>
  | PagedAutocompleteColumnDef<TData, TValue>
  | DistinctColumnDef<TData, TValue>;

export interface RowMenuItem<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: Row<T>) => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

export type CustomHeader<TData, TValue = unknown> = Header<TData, TValue> & {
  enableSearching?: boolean;
  filterComponent?: (props: HeaderContext<TData, TValue>) => React.JSX.Element;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DataTableRef<T extends { id: string }> {
  toggleExpand: (rowId: string) => void;
}

export interface DataTableProps<T> {
  columns: CustomColumnDef<T>[];
  data: T[];
  setData?: React.Dispatch<React.SetStateAction<T[]>>;
  refresh?: () => void;
  onRowClick?: (row: Row<T>) => void;

  getRowActionMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
  getRowContextMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];

  enableSelection?: boolean;
  onRowSelect?: (rows: Row<T>[]) => void;

  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: Updater<PaginationState>) => void;

  manualSorting?: boolean;
  sort?: SortingState;
  onSortChange?: (sort: Updater<SortingState>) => void;

  manualFiltering?: boolean;
  filters?: ColumnFiltersState;
  onFiltersChange?: (filters: Updater<ColumnFiltersState>) => void;

  manualSearch?: boolean;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;

  enableReordering?: boolean;
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;
  enableAutoSizing?: boolean;

  getExpandedContent?: (row: Row<T>) => React.ReactNode;

  loading?: boolean;
  error?: string | null;

  height?: string | number;
  maxHeight?: string | number;

  ToolbarLeft?: React.FC<React.PropsWithChildren>;
  ToolbarRight?: React.FC<React.PropsWithChildren>;
}
