'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React from 'react';
import { cn } from '../../utils';
import { Button } from './button';
import type { CustomColumnDef, CustomHeader } from './data-table-types';

export function DraggableColumnHeader<T>({
  header,
  enableColumnReordering,
  renderColumnHeader
}: {
  header: CustomHeader<T>;
  enableColumnReordering: boolean;
  renderColumnHeader: (header: CustomHeader<T>) => React.ReactNode;
}) {
  const columnDef = header.column.columnDef as CustomColumnDef<T>;
  const canReorderThisColumn = columnDef.enableReordering !== false;

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
