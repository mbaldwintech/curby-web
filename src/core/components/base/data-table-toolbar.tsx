'use client';

import { ChevronDown, Columns3, FilterX, RefreshCw, Search } from 'lucide-react';
import { Table as TanstackTable } from '@tanstack/react-table';
import { X } from 'lucide-react';
import React from 'react';
import { cn } from '../../utils';
import { Button } from './button';
import type { CustomColumnDef } from './data-table-types';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from './input';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface DataTableToolbarProps<T> {
  columns: CustomColumnDef<T>[];
  table: TanstackTable<T>;
  searchActive: boolean;
  controlledSearch?: string;
  search: string;
  loading?: boolean;
  refresh?: () => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchTextChange: (text: string) => void;
}

export function DataTableToolbar<T>({
  columns,
  table,
  searchActive,
  controlledSearch,
  search,
  loading,
  refresh,
  onSearchOpen,
  onSearchClose,
  onSearchTextChange
}: DataTableToolbarProps<T>) {
  return (
    <>
      {columns.some((c) => c.enableHiding) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <ChevronDown />
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
            onChange={(e) => onSearchTextChange(e.target.value)}
            placeholder="Search..."
            className="h-8 w-full pr-8 text-sm"
            autoFocus
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 flex justify-center align-center">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive hover:text-foreground dark:hover:bg-destructive dark:hover:text-foreground h-7 w-7"
                  onClick={() => onSearchTextChange('')}
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
          onClick={searchActive ? onSearchClose : onSearchOpen}
        >
          <Search />
        </Button>
      )}
      {table.getState().columnFilters.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.resetColumnFilters()}
          disabled={table.getState().columnFilters.length === 0}
        >
          <FilterX />
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
          <RefreshCw className={cn(loading && 'animate-spin')} />
        </Button>
      )}
    </>
  );
}
