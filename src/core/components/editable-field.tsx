'use client';

import { cn } from '@core/utils';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Button, Textarea } from './base';

export const EditableField = ({
  value,
  onChange,
  className
}: {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const saveEdit = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  return isEditing ? (
    <div className="w-full flex flex-col gap-2">
      <Textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="text-base text-center min-h-[100px] min-w-50"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={cancelEditing}>
          Cancel
        </Button>
        <Button size="sm" onClick={saveEdit}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  ) : (
    <div className="relative w-full group flex flex-col items-center justify-between">
      <span
        onClick={startEditing}
        className={cn(
          'border-1 rounded-md p-2 border-transparent hover:border-highlight hover:shadow-sm transition-all min-w-50 cursor-pointer',
          className
        )}
      >
        {value}
      </span>
    </div>
  );
};
