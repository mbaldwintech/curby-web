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

import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
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
  ColumnMeta,
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

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, GripVertical, X } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export interface PagedAutocompleteFilterComponentOptions {
  getCount: (query: string) => Promise<number>;
  fetchOptions: (query: string, page: number, pageSize: number) => Promise<{ id: string; label: string }[]>;
}

export interface DistinctFilterComponentOptions<T> {
  getOptions: () => Promise<T[]>;
}

export type FilterComponent<TData, TValue> = (props: HeaderContext<TData, TValue>) => React.JSX.Element;

export type CustomColumnMeta<TData, TValue> = ColumnMeta<TData, TValue> & {
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'left' | 'center' | 'right';
  truncate?: boolean; // Whether to truncate text with ellipsis (default: true)
  showTooltip?: boolean; // Whether to show tooltip on truncated text (default: true)
};

// Base definition for columns
export type BaseCustomColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean; // Whether this column can be reordered (default: true)
  filterComponent?: FilterComponent<TData, TValue>;
  filterComponentOptions?: never; // <-- if you provide a raw function, you shouldn't pass options
  meta?: CustomColumnMeta<TData, TValue>;
};

// Column with autocomplete
export type PagedAutocompleteColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean; // Whether this column can be reordered (default: true)
  filterComponent: 'paged-autocomplete';
  filterComponentOptions: PagedAutocompleteFilterComponentOptions;
};

// Column with distinct select
export type DistinctColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSearching?: boolean;
  enableReordering?: boolean; // Whether this column can be reordered (default: true)
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

// Component to handle conditional tooltip based on text overflow
function TruncatedCellContent({
  shouldTruncate,
  shouldShowTooltip,
  cellValue,
  children
}: {
  shouldTruncate: boolean;
  shouldShowTooltip: boolean;
  cellValue: string;
  children: React.ReactNode;
}) {
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Check if content is overflowing
  const checkOverflow = React.useCallback(() => {
    if (contentRef.current && shouldTruncate) {
      const isOverflow = contentRef.current.scrollWidth > contentRef.current.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, [shouldTruncate]);

  // Check overflow on mount and when content changes
  React.useLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, children]);

  // Listen for resize events to handle column resizing
  React.useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  const content = (
    <div
      ref={contentRef}
      className={cn(
        'flex-1', // Take remaining space
        shouldTruncate && 'truncate overflow-hidden'
      )}
    >
      {children}
    </div>
  );

  if (shouldShowTooltip && cellValue && isOverflowing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{cellValue}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

const getAlignment = <TData, TValue = unknown>(meta?: CustomColumnMeta<TData, TValue>): string => {
  let className = 'justify-start'; // Default alignment

  switch (meta?.align) {
    case 'top':
      className += ' items-start';
      break;
    case 'bottom':
      className += ' items-end';
      break;
    case 'middle':
    default:
      className += ' items-center';
      break;
  }

  switch (meta?.justify) {
    case 'right':
      return className.replace('justify-start', 'justify-end');
    case 'center':
      return className.replace('justify-start', 'justify-center');
    case 'left':
    default:
      return className;
  }
};

function DraggableRow<T extends { id: string }>({
  row,
  onClick,
  getRowContextMenuItems,
  getExpandedContent,
  isExpanded
}: {
  row: Row<T>;
  onClick?: () => void;
  getRowContextMenuItems?: (row: Row<T>) => Promise<RowMenuItem<T>[]> | RowMenuItem<T>[];
  getExpandedContent?: (row: Row<T>) => React.ReactNode;
  isExpanded?: boolean;
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
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{
            width: `${cell.column.getSize()}px`
          }}
        >
          <div className={cn('flex items-center', getAlignment(cell.column.columnDef.meta))}>
            <TruncatedCellContent
              shouldTruncate={(cell.column.columnDef.meta as CustomColumnMeta<T, unknown>)?.truncate !== false}
              shouldShowTooltip={(cell.column.columnDef.meta as CustomColumnMeta<T, unknown>)?.showTooltip !== false}
              cellValue={String(cell.getValue() || '')}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TruncatedCellContent>
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
      {getExpandedContent && isExpanded && (
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

function DraggableColumnHeader<T>({
  header,
  enableColumnReordering,
  renderColumnHeader
}: {
  header: CustomHeader<T>;
  enableColumnReordering: boolean;
  renderColumnHeader: (header: CustomHeader<T>) => React.ReactNode;
}) {
  const columnDef = header.column.columnDef as CustomColumnDef<T>;
  const canReorderThisColumn = columnDef.enableReordering !== false; // Default to true if not specified

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, setActivatorNodeRef } = useSortable({
    id: header.id,
    disabled: !enableColumnReordering || !canReorderThisColumn
  });

  if (!enableColumnReordering || !canReorderThisColumn) {
    return <>{renderColumnHeader(header)}</>;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn('group flex items-center w-full relative', isDragging && 'opacity-50')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition
      }}
    >
      {/* Drag handle - only show if column can be reordered */}
      {canReorderThisColumn && (
        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          className={cn(
            'group-hover:text-foreground/50 hover:text-accent-foreground active:text-accent-foreground',
            'dark:group-hover:text-foreground/50 dark:hover:text-accent-foreground dark:active:text-accent-foreground',
            'mr-2 size-8 flex transition-opacity opacity-0 group-hover:opacity-100',
            'cursor-grab active:cursor-grabbing'
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      )}
      {renderColumnHeader(header)}
    </div>
  );
}

function getPagedAutocompleteFilterComponent<TData, TValue>(
  options: PagedAutocompleteFilterComponentOptions
): FilterComponent<TData, TValue> {
  return function AutocompleteFilter({ column }: HeaderContext<TData, TValue>) {
    const val = column.getFilterValue() as string | undefined;
    return (
      <Autocomplete
        value={val}
        pageSize={10}
        getCount={options.getCount}
        fetchItems={options.fetchOptions}
        onSelect={(value) => {
          column.setFilterValue(value ?? null);
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

const ExpandIconButton = React.memo(
  function ExpandIconButton({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 p-0',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'transition-transform duration-200 ease-in-out',
          isExpanded ? 'rotate-90' : ''
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  },
  (prevProps, nextProps) => prevProps.isExpanded === nextProps.isExpanded
);

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
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;
  enableAutoSizing?: boolean; // Auto-size columns based on content

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
    enableColumnReordering = true,
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
    enableAutoSizing = true,

    ToolbarLeft,
    ToolbarRight
  }: DataTableProps<T>,
  ref: React.Ref<DataTableRef<T>>
) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
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
    // Measure width if either column resizing or auto-sizing is enabled
    if ((!enableColumnResizing && !enableAutoSizing) || !tableContainerRef.current) return;

    const updateWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(tableContainerRef.current);

    return () => resizeObserver.disconnect();
  }, [enableColumnResizing, enableAutoSizing]);

  // Helper function to estimate text width (approximation)
  const estimateTextWidth = React.useCallback((text: string, fontSize = 14): number => {
    // Rough estimation: average character width is ~0.6 of font size for typical fonts
    // Add some padding for safety
    const avgCharWidth = fontSize * 0.6;
    return Math.ceil(text.length * avgCharWidth) + 32; // +32px for padding
  }, []);

  // Helper function to get content-based column width
  const getContentBasedWidth = React.useCallback(
    (column: CustomColumnDef<T>, columnId: string, isFirstColumn: boolean): number => {
      if (!data || data.length === 0) return 150; // Default if no data

      const sampleSize = Math.min(data.length, 10); // Sample first 10 rows for performance
      let maxWidth = 0;

      // Check header width including all controls
      const headerText = typeof column.header === 'string' ? column.header : columnId;
      let headerWidth = estimateTextWidth(headerText, 14);

      // Add space for header controls
      if (enableColumnReordering) {
        headerWidth += 40; // Drag handle: 32px button + 8px margin
      }

      // Add space for sort button (if sorting is enabled for this column)
      if (column.enableSorting !== false) {
        headerWidth += 40; // Sort button: 32px button + 8px margin
      }

      // Add space for filter button (if filtering is enabled for this column)
      if (column.enableColumnFilter !== false && column.filterComponent) {
        headerWidth += 40; // Filter button: 32px button + 8px margin
      }

      maxWidth = Math.max(maxWidth, headerWidth);

      // Sample row data to find max content width
      for (let i = 0; i < sampleSize; i++) {
        const row = data[i];
        let cellContent = '';

        try {
          // Type-cast to access column properties safely
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const accessorColumn = column as any;

          if (accessorColumn.accessorKey) {
            // Handle nested accessors like 'user.name'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = accessorColumn.accessorKey.split('.').reduce((obj: any, key: string) => obj?.[key], row);
            cellContent = value?.toString() || '';
          } else if (accessorColumn.accessorFn) {
            cellContent = accessorColumn.accessorFn(row, i)?.toString() || '';
          } else if (column.id) {
            // Try to access the row data by column id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rowData = row as any;
            cellContent = rowData[column.id]?.toString() || '';
          }
        } catch {
          // If we can't access the data, just use empty string
          cellContent = '';
        }

        if (cellContent) {
          maxWidth = Math.max(maxWidth, estimateTextWidth(cellContent, 14));
        }
      }

      // Add space for expand icon if this is the first column and expandable content is available
      if (isFirstColumn && getExpandedContent) {
        maxWidth += 32; // 24px for button (h-6 w-6) + 8px for margin (mr-2)
      }

      // Apply reasonable bounds (increased max for columns with many header controls)
      return Math.min(Math.max(maxWidth, 80), 500); // Min 80px, max 500px
    },
    [data, estimateTextWidth, getExpandedContent, enableColumnReordering]
  );

  // Helper function to calculate intelligent column sizing
  const calculateIntelligentColumnSizing = React.useCallback(
    (columns: CustomColumnDef<T>[]): ColumnSizingState => {
      const sizing: ColumnSizingState = {};

      // First, set all column sizes from their config, auto-size, or default
      columns.forEach((column, index) => {
        const columnId = column.id || (column as CustomColumnDef<T> & { accessorKey?: string }).accessorKey;
        if (columnId) {
          if (column.size) {
            // Use explicit size if provided
            sizing[columnId] = column.size;
          } else if (enableAutoSizing) {
            // Auto-size based on content
            const isFirstColumn = index === 0;
            sizing[columnId] = getContentBasedWidth(column, columnId, isFirstColumn);
          } else {
            // Use default size
            sizing[columnId] = 150;
          }
        }
      });

      // If we have a container width, adjust the last column to fill remaining space
      if (containerWidth > 0) {
        // Use columnOrder to get the correct visual order, fallback to Object.keys if columnOrder is empty
        const orderedColumnIds = columnOrder.length > 0 ? columnOrder : Object.keys(sizing);
        if (orderedColumnIds.length > 0) {
          const lastColumnId = orderedColumnIds[orderedColumnIds.length - 1];
          const otherColumnIds = orderedColumnIds.slice(0, -1);

          // Calculate total width of all columns except the last one
          const otherColumnsWidth = otherColumnIds.reduce((sum, id) => sum + (sizing[id] || 150), 0);

          // Calculate what the last column width should be to fill the container
          const targetLastColumnWidth = Math.max(
            containerWidth - otherColumnsWidth,
            50 // Minimum width for the last column
          );

          sizing[lastColumnId] =
            sizing[lastColumnId] > targetLastColumnWidth ? sizing[lastColumnId] : targetLastColumnWidth;
        }
      }

      return sizing;
    },
    [containerWidth, getContentBasedWidth, enableAutoSizing, columnOrder]
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
        // Use columnOrder to get the correct visual order, fallback to Object.keys if columnOrder is empty
        const orderedColumnIds = columnOrder.length > 0 ? columnOrder : Object.keys(newState);
        if (orderedColumnIds.length === 0) return newState;

        const lastColumnId = orderedColumnIds[orderedColumnIds.length - 1];
        const otherColumnIds = orderedColumnIds.slice(0, -1);

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

  const handleToggleExpand = useCallback((rowId: string) => {
    setExpandedRow((prev) => (prev === rowId ? null : rowId));
  }, []);

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

    if (enableReordering || enableSelection || getExpandedContent) {
      let size = 0;
      if (enableReordering) {
        size += 32; // Drag handle width
      }
      if (enableSelection) {
        size += 32; // Checkbox width
      }
      if (getExpandedContent) {
        size += 32; // Expand icon width
      }
      _cols.unshift({
        id: 'interactions-column',
        size,
        enableReordering: false,
        enableColumnFilter: false,
        enableResizing: false,
        enableSearching: false,
        enablePinning: false,
        enableGrouping: false,
        enableSorting: false,
        enableHiding: false,
        header: enableSelection
          ? ({ table }) => (
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(!!value);
                    if (onRowSelect) {
                      const selectedRows = value ? table.getRowModel().rows.filter((row) => row.getIsSelected()) : [];
                      onRowSelect(selectedRows);
                    }
                  }}
                  aria-label="Select all"
                  className={cn(
                    'data-[state=unchecked]:bg-background/70 dark:data-[state=unchecked]:bg-background/70',
                    enableReordering ? 'ml-[34px]' : ''
                  )}
                />
              </div>
            )
          : () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-center space-x-2">
            {enableReordering && <DragHandle id={row.original.id} />}
            {enableSelection && (
              <Checkbox
                onClick={(e) => e.stopPropagation()}
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
            )}
            {getExpandedContent && (
              <ExpandIconButton
                isExpanded={expandedRow === row.original.id}
                onClick={() => handleToggleExpand(row.original.id)}
              />
            )}
          </div>
        )
      });
    }

    if (getRowActionMenuItems) {
      _cols.push({
        id: 'actions',
        size: 80, // Fixed width for actions dropdown column
        cell: ({ row }) => <ActionsCell row={row} getRowActionMenuItems={getRowActionMenuItems} />,
        enableSorting: false,
        enableHiding: false,
        meta: { justify: 'right' },
        enableReordering: false
      });
    }

    setColumnSizing(calculateIntelligentColumnSizing(_cols));

    // Initialize column order if not set or if columns changed
    setColumnOrder((currentOrder) => {
      const newColumnIds = _cols
        .map((col) => col.id || (col as CustomColumnDef<T> & { accessorKey?: string }).accessorKey)
        .filter(Boolean) as string[];

      // If current order is empty or doesn't match new columns, reset it
      if (
        currentOrder.length === 0 ||
        currentOrder.length !== newColumnIds.length ||
        !newColumnIds.every((id) => currentOrder.includes(id))
      ) {
        return newColumnIds;
      }
      return currentOrder;
    });

    setColumns(_cols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputColumns, enableReordering, enableSelection, getRowActionMenuItems, onRowSelect, expandedRow]);

  useEffect(() => {
    buildColumns();
  }, [buildColumns]);

  // Recalculate column sizing when container width or data changes
  React.useEffect(() => {
    if (columns.length > 0 && containerWidth > 0) {
      setColumnSizing(calculateIntelligentColumnSizing(columns));
    }
  }, [containerWidth, calculateIntelligentColumnSizing, columns, data]);

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
      columnSizing,
      columnOrder
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
    onColumnOrderChange: setColumnOrder,
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

  // Initialize column order when table is created
  React.useEffect(() => {
    if (columnOrder.length === 0 && table.getAllColumns().length > 0) {
      const initialColumnOrder = table.getAllColumns().map((col) => col.id);
      setColumnOrder(initialColumnOrder);
    }
  }, [table, columnOrder.length]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      // Check if this is a column drag (column IDs are strings, row IDs are from data)
      const isColumnDrag = columnOrder.includes(active.id as string);

      if (isColumnDrag) {
        // Handle column reordering
        setColumnOrder((columnOrder) => {
          const oldIndex = columnOrder.indexOf(active.id as string);
          const newIndex = columnOrder.indexOf(over.id as string);
          return arrayMove(columnOrder, oldIndex, newIndex);
        });
      } else {
        // Handle row reordering
        setData?.((data) => {
          const oldIndex = dataIds.indexOf(active.id);
          const newIndex = dataIds.indexOf(over.id);
          return arrayMove(data, oldIndex, newIndex);
        });
      }
    }
  }

  function renderColumnHeader(header: CustomHeader<T>) {
    const column = header.column.columnDef as CustomColumnDef<T>;

    return (
      <div className="group flex items-center gap-0 relative">
        <div className="flex-1 truncate overflow-hidden">
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
        </div>

        {/* Sort button */}
        {column.enableSorting !== false && header.column.getCanSort() ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'group-hover:text-foreground/50 hover:text-accent-foreground active:text-accent-foreground',
              'dark:group-hover:text-foreground/50 dark:hover:text-accent-foreground dark:active:text-accent-foreground',
              'ml-2 size-8 flex transition-opacity opacity-0 group-hover:opacity-100',
              header.column.getIsSorted() && 'opacity-100'
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
                    'group-hover:text-foreground/50 hover:text-accent-foreground active:text-accent-foreground',
                    'dark:group-hover:text-foreground/50 dark:hover:text-accent-foreground dark:active:text-accent-foreground',
                    'mr-2 size-8 flex transition-opacity opacity-0 group-hover:opacity-100',
                    header.column.getIsFiltered() && 'opacity-100'
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
    <TooltipProvider>
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
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors} id={sortableId}>
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
              {table.getHeaderGroups().map((headerGroup) => {
                // Filter column order to only include reorderable columns
                const reorderableColumnOrder = columnOrder.filter((colId) => {
                  const header = headerGroup.headers.find((h) => h.id === colId);
                  if (!header) return true; // If header not found, allow it (fallback)
                  const columnDef = header.column.columnDef as CustomColumnDef<T>;
                  return columnDef.enableReordering !== false;
                });

                return (
                  <TableRow key={headerGroup.id}>
                    <SortableContext
                      items={reorderableColumnOrder}
                      strategy={horizontalListSortingStrategy}
                      disabled={!enableColumnReordering}
                    >
                      {headerGroup.headers.map(<TData, TValue = unknown>(header: CustomHeader<T>) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={cn(
                            'group relative overflow-hidden',
                            (header.column.columnDef.meta as CustomColumnMeta<TData, TValue>)?.justify === 'right' &&
                              'text-right'
                          )}
                          style={{
                            width: enableColumnResizing ? `${header.getSize()}px` : undefined
                          }}
                        >
                          {enableColumnResizing && header.column.getCanResize() && (
                            <div
                              data-no-dnd="true"
                              className={cn(
                                'absolute left-0 top-0 h-full w-[1px]',
                                'bg-transparent group-hover:bg-border transition-colors duration-150'
                              )}
                            />
                          )}
                          <div className={cn('flex overflow-hidden', getAlignment(header.column.columnDef.meta))}>
                            <DraggableColumnHeader
                              header={header}
                              enableColumnReordering={enableColumnReordering}
                              renderColumnHeader={renderColumnHeader}
                            />
                          </div>
                          {enableColumnResizing && header.column.getCanResize() && (
                            <div
                              data-no-dnd="true"
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
                                'absolute right-0 top-0 h-full w-[1px] cursor-col-resize select-none touch-none z-10',
                                'bg-transparent transition-colors duration-150',
                                'flex items-center justify-end',
                                'after:absolute after:w-4 after:right-[2px] after:top-0 after:h-full after:content-[""]'
                              )}
                            >
                              <div className="w-[1px] h-full bg-transparent group-hover:bg-border hover:bg-border/70 active:bg-border/50 transition-colors duration-150" />
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </SortableContext>
                  </TableRow>
                );
              })}
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
    </TooltipProvider>
  );
}

export const DataTable = forwardRef(DataTableInternal) as <T extends { id: string }>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableRef<T>> }
) => React.JSX.Element;
