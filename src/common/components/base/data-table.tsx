'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconFilter,
  IconFilterFilled,
  IconFilterOff,
  IconLayoutColumns,
  IconRefresh,
  IconSearch
} from '@tabler/icons-react';
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  HeaderContext,
  PaginationState,
  Row,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils';
import { Autocomplete } from './autocomplete';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu';
import { DragHandle } from './drag-handle';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import { Input } from './input';
import { Label } from './label';
import { LoadingSpinner } from './loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface PagedAutocompleteFilterComponentOptions {
  getCount: (query: string) => Promise<number>;
  fetchOptions: (query: string, page: number, pageSize: number) => Promise<{ id: string; label: string }[]>;
}

export interface DistinctFilterComponentOptions<T> {
  getOptions: () => Promise<T[]>;
}

export type FilterComponent<TData, TValue> = (props: HeaderContext<TData, TValue>) => React.JSX.Element;

// Base definition for columns
export type BaseCustomColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  filterComponent?: FilterComponent<TData, TValue>;
  filterComponentOptions?: never; // <-- if you provide a raw function, you shouldn't pass options
};

// Column with autocomplete
export type PagedAutocompleteColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  filterComponent: 'paged-autocomplete';
  filterComponentOptions: PagedAutocompleteFilterComponentOptions;
};

// Column with distinct select
export type DistinctColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  filterComponent: 'distinct';
  filterComponentOptions: DistinctFilterComponentOptions<TValue>;
};

// Discriminated union of all
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

const getAlignment = (meta: unknown): 'justify-start' | 'justify-end' | 'justify-center' => {
  const align = (meta as { align?: string })?.align;
  if (align === 'right') return 'justify-end';
  if (align === 'center') return 'justify-center';
  return 'justify-start';
};

function DraggableRow<T extends { id: string }>({
  row,
  onClick,
  getRowContextMenuItems,
  getExpandedContent,
  isExpanded,
  onToggleExpand
}: {
  row: Row<T>;
  onClick?: () => void;
  getRowContextMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
  getExpandedContent?: (row: Row<T>) => React.ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: (rowId: string) => void;
}) {
  const [contextMenuItems, setContextMenuItems] = useState<RowMenuItem<T>[] | null>(null);
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id
  });

  const contentRef = React.useRef<HTMLDivElement>(null);

  const fetchContextMenuItems = useCallback(async () => {
    const contextMenuItems = await getRowContextMenuItems?.(row);
    setContextMenuItems(contextMenuItems ?? null);
  }, [row, getRowContextMenuItems]);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.(row.original.id);
  };

  const mainRow = (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition
      }}
      onClick={onClick}
    >
      {row.getVisibleCells().map((cell, index) => (
        <TableCell
          key={cell.id}
          style={{
            width: `${cell.column.getSize()}px`
          }}
        >
          <div className={cn('flex items-center', getAlignment(cell.column.columnDef.meta))}>
            {index === 0 && getExpandedContent && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 h-6 w-6 p-0 hover:bg-muted/50 transition-colors"
                onClick={handleExpandClick}
              >
                <ChevronRight
                  className={cn('h-4 w-4 transition-transform duration-200 ease-in-out', isExpanded && 'rotate-90')}
                />
              </Button>
            )}
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );

  const mainRowWithContextMenu =
    contextMenuItems && contextMenuItems.length > 0 ? (
      <ContextMenu>
        <ContextMenuTrigger asChild>{mainRow}</ContextMenuTrigger>
        <ContextMenuContent>
          {contextMenuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && <hr className="my-1" />}
              <ContextMenuItem
                onClick={() => item.onClick(row)}
                disabled={item.disabled}
                className={cn(item.variant === 'destructive' && 'text-destructive focus:text-destructive')}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.label}
              </ContextMenuItem>
            </React.Fragment>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    ) : (
      mainRow
    );

  useEffect(() => {
    fetchContextMenuItems();
  }, [fetchContextMenuItems]);

  return (
    <>
      {mainRowWithContextMenu}

      {/* Sub-table row */}
      {getExpandedContent && (
        <TableRow>
          <TableCell colSpan={row.getVisibleCells().length} className="p-0">
            <div
              className={cn(
                'border-l-2 border-primary/20 ml-6 overflow-hidden transition-all duration-300 ease-out',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                height: isExpanded ? 'auto' : '0px'
              }}
            >
              <div ref={contentRef} className={cn('transition-all duration-300 ease-out')}>
                {isExpanded && getExpandedContent(row)}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function getPagedAutocompleteFilterComponent<TData, TValue>(
  options: PagedAutocompleteFilterComponentOptions
): FilterComponent<TData, TValue> {
  return function AutocompleteFilter({ column }: HeaderContext<TData, TValue>) {
    return (
      <Autocomplete
        pageSize={10}
        getCount={options.getCount}
        fetchItems={options.fetchOptions}
        onSelect={(value) => {
          const { id } = value || {};
          column.setFilterValue(id === null ? undefined : id);
        }}
      />
    );
  };
}

async function getDistinctFilterComponent<TData, TValue>(
  options: DistinctFilterComponentOptions<TValue>
): Promise<FilterComponent<TData, TValue>> {
  const distinctValues = await options.getOptions();
  return function DistinctFilter(header: HeaderContext<TData, TValue>) {
    // Get the current filter value
    const value = header.column.getFilterValue() as string | undefined;

    return (
      <Select
        value={value ?? 'any'}
        onValueChange={(val) => header.column.setFilterValue(val === 'any' ? '' : val || undefined)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Filter..." />
        </SelectTrigger>
        <SelectContent className="max-h-100">
          <SelectItem value="any">Any</SelectItem>
          {distinctValues.map((opt) => (
            <SelectItem key={String(opt)} value={String(opt)}>
              {String(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
}

const ActionsCell = <T,>({
  row,
  getRowActionMenuItems
}: {
  row: Row<T>;
  getRowActionMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
}) => {
  const [rowActionMenuItems, setRowActionMenuItems] = useState<RowMenuItem<T>[] | null>(null);

  const fetchRowActionMenuItems = useCallback(async () => {
    const rowActionMenuItems = await getRowActionMenuItems?.(row);
    setRowActionMenuItems(rowActionMenuItems ?? null);
  }, [row, getRowActionMenuItems]);

  useEffect(() => {
    fetchRowActionMenuItems();
  }, [fetchRowActionMenuItems]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-60">
        {rowActionMenuItems?.map((menuItem, i) => (
          <React.Fragment key={`menuItem-${i}`}>
            {menuItem.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className={cn(menuItem.variant === 'destructive' ? 'text-destructive' : '', 'whitespace-nowrap')}
              disabled={menuItem.disabled}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                menuItem.onClick(row);
              }}
            >
              {menuItem.icon && <menuItem.icon className="mr-2 flex h-4 w-4" />}
              {menuItem.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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

  // Row Actions
  getRowActionMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
  getRowContextMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];

  // Selection
  enableSelection?: boolean;
  onRowSelect?: (rows: Row<T>[]) => void;

  // Pagination
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: Updater<PaginationState>) => void;

  // Sorting
  manualSorting?: boolean;
  sort?: SortingState;
  onSortChange?: (sort: Updater<SortingState>) => void;

  // Filtering
  manualFiltering?: boolean;
  filters?: ColumnFiltersState;
  onFiltersChange?: (filters: Updater<ColumnFiltersState>) => void;

  // Searching
  manualSearch?: boolean;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;

  enableReordering?: boolean;
  enableColumnResizing?: boolean;

  // Expanded Row
  getExpandedContent?: (row: Row<T>) => React.ReactNode;

  loading?: boolean;
  error?: string | null;

  height?: string | number;
  maxHeight?: string | number;

  ToolbarLeft?: React.FC<React.PropsWithChildren>;
  ToolbarRight?: React.FC<React.PropsWithChildren>;
}

function DataTableInternal<T extends { id: string }>(
  {
    columns: inputColumns,
    data,
    setData,
    refresh,
    enableReordering = false,
    onRowClick,
    getRowActionMenuItems,
    getRowContextMenuItems,
    getExpandedContent,

    enableSelection = false,
    onRowSelect,

    manualPagination = false,
    pageCount: controlledPageCount,
    pagination: controlledPagination,
    onPaginationChange,

    manualSorting = false,
    sort: controlledSorting,
    onSortChange,

    manualFiltering = false,
    filters: controlledFilters,
    onFiltersChange,

    manualSearch = false,
    searchText: controlledSearch,
    onSearchTextChange,

    loading = false,
    error,

    height,
    maxHeight,

    enableColumnResizing = true,

    ToolbarLeft,
    ToolbarRight
  }: DataTableProps<T>,
  ref: React.Ref<DataTableRef<T>>
) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  // Container width measurement for intelligent column sizing
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  // Measure container width
  React.useLayoutEffect(() => {
    if (!enableColumnResizing || !tableContainerRef.current) return;

    const updateWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(tableContainerRef.current);

    return () => resizeObserver.disconnect();
  }, [enableColumnResizing]);

  // Helper function to calculate intelligent column sizing
  const calculateIntelligentColumnSizing = React.useCallback(
    (columns: CustomColumnDef<T>[]): ColumnSizingState => {
      const sizing: ColumnSizingState = {};

      // First, set all column sizes from their config or default
      columns.forEach((column) => {
        const columnId = column.id || (column as CustomColumnDef<T> & { accessorKey?: string }).accessorKey;
        if (columnId) {
          sizing[columnId] = column.size || 150;
        }
      });

      // If we have a container width and column resizing is enabled, adjust the last column
      if (enableColumnResizing && containerWidth > 0) {
        const columnIds = Object.keys(sizing);
        if (columnIds.length > 0) {
          const lastColumnId = columnIds[columnIds.length - 1];
          const otherColumnIds = columnIds.slice(0, -1);

          // Calculate total width of all columns except the last one
          const otherColumnsWidth = otherColumnIds.reduce((sum, id) => sum + sizing[id], 0);

          // Calculate what the last column width should be to fill the container
          const targetLastColumnWidth = Math.max(
            containerWidth - otherColumnsWidth,
            50 // Minimum width for the last column
          );

          sizing[lastColumnId] = targetLastColumnWidth;
        }
      }

      return sizing;
    },
    [enableColumnResizing, containerWidth]
  );
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const searchableColumns = useMemo(
    () =>
      inputColumns
        .filter((c) => c.enableSearching)
        .map((c) => (c as { accessorKey: string }).accessorKey || c.id)
        .filter(Boolean) as string[],
    [inputColumns]
  );
  const sortableId = React.useId();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8 // Require a minimum drag distance to activate
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {})
  );
  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((old) => {
      const newState = typeof updater === 'function' ? updater(old) : updater;
      if (onPaginationChange) {
        onPaginationChange(newState);
      }
      return newState;
    });
  };

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((old) => {
      const newState = typeof updater === 'function' ? updater(old) : updater;
      if (onSortChange) {
        onSortChange(newState);
      }
      return newState;
    });
  };

  const handleFilteringChange = (updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((old) => {
      const newState = typeof updater === 'function' ? updater(old) : updater;
      if (onFiltersChange) {
        onFiltersChange(newState);
      }
      return newState;
    });
  };

  const handleColumnSizingChange = (updater: Updater<ColumnSizingState>) => {
    setColumnSizing((old) => {
      const newState = typeof updater === 'function' ? updater(old) : updater;

      // Apply intelligent column sizing to ensure table always fills container
      if (enableColumnResizing && containerWidth > 0) {
        const columnIds = Object.keys(newState);
        if (columnIds.length === 0) return newState;

        const lastColumnId = columnIds[columnIds.length - 1];
        const otherColumnIds = columnIds.slice(0, -1);

        // Calculate total width of all columns except the last one
        const otherColumnsWidth = otherColumnIds.reduce((sum, id) => sum + (newState[id] || 150), 0);

        // Calculate what the last column width should be to fill the container
        const targetLastColumnWidth = Math.max(
          containerWidth - otherColumnsWidth,
          50 // Minimum width for the last column
        );

        // Update the last column width to fill remaining space
        newState[lastColumnId] = targetLastColumnWidth;
      }

      return newState;
    });
  };

  const handleSearchOpen = () => {
    setSearchActive(true);
    handleSearchTextChange('');
  };

  const handleSearchClose = () => {
    setSearchActive(false);
    handleSearchTextChange('');
  };

  const handleSearchTextChange = (text: string) => {
    setSearch(text);
    if (onSearchTextChange) {
      onSearchTextChange(text);
    }
  };

  const handleToggleExpand = (rowId: string) => {
    setExpandedRow((prev) => (prev === rowId ? null : rowId));
  };

  const [columns, setColumns] = useState<CustomColumnDef<T>[]>([]);
  const buildColumns = useCallback(async () => {
    const _cols = await Promise.all(
      [...inputColumns].map(async (col): Promise<BaseCustomColumnDef<T, unknown>> => {
        if (col.filterComponent === 'distinct') {
          return {
            ...col,
            filterComponent: await getDistinctFilterComponent<T, unknown>(col.filterComponentOptions),
            filterComponentOptions: undefined
          };
        }
        if (col.filterComponent === 'paged-autocomplete') {
          return {
            ...col,
            filterComponent: getPagedAutocompleteFilterComponent<T, unknown>(col.filterComponentOptions),
            filterComponentOptions: undefined
          };
        }
        return col;
      })
    );

    if (enableSelection) {
      _cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false
              }
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
                if (onRowSelect) {
                  const selectedRows = value ? table.getRowModel().rows.filter((row) => row.getIsSelected()) : [];
                  onRowSelect(selectedRows);
                }
              }}
              aria-label="Select all"
              className="dark:data-[state=unchecked]:bg-background/70"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
                if (onRowSelect) {
                  const selectedRows = value ? [row, ...table.getSelectedRowModel().rows] : [];
                  onRowSelect(selectedRows);
                }
              }}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false
      });
    }

    if (enableReordering) {
      _cols.unshift({
        id: 'drag',
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />
      });
    }

    if (getRowActionMenuItems) {
      _cols.push({
        id: 'actions',
        cell: ({ row }) => <ActionsCell row={row} getRowActionMenuItems={getRowActionMenuItems} />,
        enableSorting: false,
        enableHiding: false,
        meta: { align: 'right' }
      });
    }

    setColumnSizing(calculateIntelligentColumnSizing(_cols));

    setColumns(_cols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputColumns, enableReordering, enableSelection, getRowActionMenuItems, onRowSelect]);

  useEffect(() => {
    buildColumns();
  }, [buildColumns]);

  // Recalculate column sizing when container width changes
  React.useEffect(() => {
    if (columns.length > 0 && containerWidth > 0) {
      setColumnSizing(calculateIntelligentColumnSizing(columns));
    }
  }, [containerWidth, calculateIntelligentColumnSizing, columns]);

  const restrictedGlobalFilter: FilterFn<T> = (row, _columnId, filterValue) => {
    if (!filterValue) return true;
    return searchableColumns.some((colId) => {
      const cellValue = row.getValue(colId);
      return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: manualSorting ? controlledSorting : sorting,
      columnVisibility,
      rowSelection,
      columnFilters: manualFiltering ? controlledFilters : columnFilters,
      pagination: manualPagination ? controlledPagination : pagination,
      globalFilter: manualSearch ? undefined : search,
      columnSizing
    },
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: manualPagination ? (controlledPageCount ?? -1) : undefined,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    enableGlobalFilter: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFilteringChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onColumnSizingChange: handleColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualSearch ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: restrictedGlobalFilter,
    enableSorting: true,
    enableSortingRemoval: true,
    sortDescFirst: false,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
      size: 150
    }
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData?.((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  function renderColumnHeader(header: CustomHeader<T>) {
    const column = header.column.columnDef as CustomColumnDef<T>;

    return (
      <div className="group flex items-center gap-0 relative">
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

        {/* Sort button */}
        {column.enableSorting !== false && header.column.getCanSort() ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'ml-2 size-8 flex transition-opacity opacity-0 group-hover:opacity-100',
              header.column.getIsSorted() && 'opacity-100 bg-primary/70 text-primary-foreground'
            )}
            onClick={header.column.getToggleSortingHandler()}
          >
            {header.column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : header.column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown />
            )}
            <span className="sr-only">
              {header.column.getIsSorted()
                ? `Sorted ${header.column.getIsSorted()}`
                : 'Not sorted. Click to sort ascending'}
            </span>
          </Button>
        ) : null}

        {/* Filter button */}
        {column.enableColumnFilter !== false &&
          column.filterComponent &&
          typeof column.filterComponent === 'function' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'mr-2 size-8 flex transition-opacity opacity-0 group-hover:opacity-100',
                    header.column.getIsFiltered() && 'opacity-100 bg-primary/70 text-primary-foreground'
                  )}
                >
                  {header.column.getIsFiltered() ? <IconFilterFilled /> : <IconFilter />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">{column.filterComponent(header.getContext())}</PopoverContent>
            </Popover>
          )}
      </div>
    );
  }

  useImperativeHandle<DataTableRef<T>, DataTableRef<T>>(ref, (): DataTableRef<T> => {
    return {
      toggleExpand: handleToggleExpand
    };
  });

  const DefaultToolbarContent = () => (
    <>
      {columns.some((c) => c.enableHiding) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {searchActive && (
        <div className="relative w-full md:w-64 lg:w-80">
          <Input
            value={controlledSearch || search || ''}
            onChange={(e) => handleSearchTextChange(e.target.value)}
            placeholder="Search..."
            className="h-8 w-full pr-8 text-sm" // add right padding so text doesn't overlap the button
            autoFocus
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 flex justify-center align-center">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive hover:text-foreground dark:hover:bg-destructive dark:hover:text-foreground h-7 w-7"
                  onClick={() => handleSearchTextChange('')}
                >
                  <X size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear search</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      {columns.some((c) => c.enableSearching) && (
        <Button
          variant={searchActive ? 'default' : 'outline'}
          size="sm"
          className={cn(searchActive && 'bg-primary text-primary-foreground')}
          onClick={searchActive ? handleSearchClose : handleSearchOpen}
        >
          <IconSearch />
        </Button>
      )}
      {table.getState().columnFilters.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.resetColumnFilters()}
          disabled={table.getState().columnFilters.length === 0}
        >
          <IconFilterOff />
        </Button>
      )}
      {refresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (refresh) {
              refresh();
            }
          }}
        >
          <IconRefresh className={cn(loading && 'animate-spin')} />
        </Button>
      )}
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between px-4">
        {ToolbarLeft && (
          <div className="flex items-center gap-2">
            <ToolbarLeft />
          </div>
        )}
        <div className="w-full flex-1 flex items-center justify-end gap-2">
          {ToolbarRight && (
            <ToolbarRight>
              <DefaultToolbarContent />
            </ToolbarRight>
          )}
          {!ToolbarRight && <DefaultToolbarContent />}
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border" ref={tableContainerRef}>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table
            containerClassName="overflow-auto"
            containerStyle={{ height, maxHeight }}
            style={{
              width: '100%',
              minWidth: enableColumnResizing ? table.getCenterTotalSize() : undefined,
              tableLayout: enableColumnResizing ? 'fixed' : 'auto'
            }}
          >
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: CustomHeader<T>) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'relative',
                        (header.column.columnDef.meta as { align?: string })?.align === 'right' && 'text-right'
                      )}
                      style={{
                        width: enableColumnResizing ? `${header.getSize()}px` : undefined
                      }}
                    >
                      <div className={cn('flex', getAlignment(header.column.columnDef.meta))}>
                        {renderColumnHeader(header)}
                      </div>
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const handler = header.getResizeHandler();
                            handler(e);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            const handler = header.getResizeHandler();
                            handler(e);
                          }}
                          className={cn(
                            'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none z-10',
                            'bg-transparent hover:bg-primary/40 transition-colors duration-150',
                            header.column.getIsResizing() && 'bg-primary w-[2px]',
                            // Add a larger hit area for easier grabbing
                            'after:absolute after:right-[-2px] after:top-0 after:h-full after:w-1 after:content-[""]'
                          )}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <LoadingSpinner loading={true} size={50} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      onClick={() => onRowClick?.(row)}
                      getRowContextMenuItems={getRowContextMenuItems}
                      getExpandedContent={getExpandedContent}
                      isExpanded={expandedRow && expandedRow === row.original.id ? true : false}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export const DataTable = forwardRef(DataTableInternal) as <T extends { id: string }>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableRef<T>> }
) => React.JSX.Element;
