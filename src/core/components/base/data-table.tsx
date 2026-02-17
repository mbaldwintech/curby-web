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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Filter, ListFilter } from 'lucide-react';
import {
  AccessorFnColumnDef,
  AccessorKeyColumnDef,
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
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import type {
  BaseCustomColumnDef,
  CustomColumnDef,
  CustomColumnMeta,
  CustomHeader,
  DataTableProps,
  DataTableRef
} from './data-table-types';
import { DraggableColumnHeader } from './data-table-column-header';
import { getDistinctFilterComponent, getPagedAutocompleteFilterComponent } from './data-table-filters';
import { DataTablePagination } from './data-table-pagination';
import { ActionsCell, DraggableRow, ExpandIconButton, getAlignment } from './data-table-row';
import { DataTableToolbar } from './data-table-toolbar';
import { DragHandle } from './drag-handle';
import { LoadingSpinner } from './loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { TooltipProvider } from './tooltip';

// Re-export all types and components from extracted modules
export * from './data-table-types';
export * from './data-table-filters';
export * from './data-table-row';
export * from './data-table-column-header';
export * from './data-table-toolbar';
export * from './data-table-pagination';

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
      if (!data) return 150; // Default if no data

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
          const accessorColumn = column as CustomColumnDef<T> & AccessorKeyColumnDef<T> & AccessorFnColumnDef<T>;

          if (accessorColumn.accessorKey && typeof accessorColumn.accessorKey === 'string') {
            // Handle nested accessors like 'user.name'
            const value = accessorColumn.accessorKey
              .split('.')
              .reduce((obj: unknown, key: string) => obj?.[key as keyof typeof obj], row);
            cellContent = value?.toString() || '';
          } else if (accessorColumn.accessorFn) {
            cellContent = accessorColumn.accessorFn(row, i)?.toString() || '';
          } else if (column.id) {
            // Try to access the row data by column id
            const rowData = row;
            cellContent = rowData[column.id as keyof typeof rowData]?.toString() || '';
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
        const columnId = column.id || ((column as CustomColumnDef<T> & AccessorKeyColumnDef<T>).accessorKey as string);
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
        const orderedColumnIds = (columnOrder.length > 0 ? columnOrder : Object.keys(sizing)).filter(
          (col) => columnVisibility[col] === undefined || columnVisibility[col]
        );
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
    [containerWidth, getContentBasedWidth, enableAutoSizing, columnOrder, columnVisibility]
  );
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const searchableColumns = useMemo(
    () =>
      inputColumns
        .filter((c) => c.enableSearching)
        .map((c) => (c as AccessorKeyColumnDef<T>).accessorKey || c.id)
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
        onFiltersChange(
          newState.map((filter) => ({ id: filter.id, value: filter.value === 'null' ? null : filter.value }))
        );
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
        const orderedColumnIds = (columnOrder.length > 0 ? columnOrder : Object.keys(newState)).filter(
          (col) => columnVisibility[col] === undefined || columnVisibility[col]
        );
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
        .map((col) => col.id || (col as CustomColumnDef<T> & AccessorKeyColumnDef<T>).accessorKey)
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

  useEffect(() => {
    setColumnFilters(
      controlledFilters
        ? controlledFilters.map((filter) => ({
            id: filter.id,
            value: filter.value === null ? 'null' : filter.value
          }))
        : []
    );
  }, [controlledFilters]);

  useEffect(() => {
    setColumnVisibility(
      inputColumns.reduce((acc, col) => {
        const colId = col.id || ((col as CustomColumnDef<T> & AccessorKeyColumnDef<T>).accessorKey as string);
        if (colId) {
          if (col.enableHiding === false) {
            if (colId) {
              acc[colId] = true;
            }
          } else if (col.defaultHidden) {
            acc[colId] = false;
          }
        }
        return acc;
      }, {} as VisibilityState)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  {header.column.getIsFiltered() ? <ListFilter /> : <Filter />}
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

  const toolbarContent = (
    <DataTableToolbar
      columns={columns}
      table={table}
      searchActive={searchActive}
      controlledSearch={controlledSearch}
      search={search}
      loading={loading}
      refresh={refresh}
      onSearchOpen={handleSearchOpen}
      onSearchClose={handleSearchClose}
      onSearchTextChange={handleSearchTextChange}
    />
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
          {ToolbarRight && <ToolbarRight>{toolbarContent}</ToolbarRight>}
          {!ToolbarRight && toolbarContent}
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
      <DataTablePagination table={table} />
    </TooltipProvider>
  );
}

export const DataTable = forwardRef(DataTableInternal) as <T extends { id: string }>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableRef<T>> }
) => React.JSX.Element;
