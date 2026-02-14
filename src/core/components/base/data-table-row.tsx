'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconDotsVertical } from '@tabler/icons-react';
import { flexRender, Row } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '../../utils';
import { Button } from './button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu';
import type { CustomColumnMeta, RowMenuItem } from './data-table-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import { TableCell, TableRow } from './table';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export function TruncatedCellContent({
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

  const checkOverflow = React.useCallback(() => {
    if (contentRef.current && shouldTruncate) {
      const isOverflow = contentRef.current.scrollWidth > contentRef.current.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, [shouldTruncate]);

  React.useLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, children]);

  React.useEffect(() => {
    checkOverflow();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkOverflow);
      return () => {
        window.removeEventListener('resize', checkOverflow);
      };
    }
  }, [checkOverflow]);

  const content = (
    <div ref={contentRef} className={cn('flex-1', shouldTruncate && 'truncate overflow-hidden')}>
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

export const getAlignment = <TData, TValue = unknown>(meta?: CustomColumnMeta<TData, TValue>): string => {
  let className = 'justify-start';

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

export function DraggableRow<T extends { id: string }>({
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
              <ContextMenuItem onClick={() => item.onClick(row)} disabled={item.disabled} variant={item.variant}>
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

export const ActionsCell = <T,>({
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
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8 justify-self-end"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-60">
        {rowActionMenuItems?.map((menuItem, i) => (
          <React.Fragment key={`menuItem-${i}`}>
            {menuItem.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={menuItem.variant === 'destructive' ? 'destructive' : 'default'}
              className="whitespace-nowrap"
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

export const ExpandIconButton = React.memo(
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
