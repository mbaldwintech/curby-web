'use client';

import { cn } from '@core/utils';
import { X } from 'lucide-react';
import React, { KeyboardEvent, useState } from 'react';
import { Badge } from './base';

interface TagInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'placeholder'> {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  distinct?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  className,
  placeholder = 'Type and press Enter...',
  distinct = false,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTag = inputValue.trim();

      if (!distinct || !value.includes(newTag)) {
        onChange?.([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Backspace removes last tag if input is empty
      onChange?.(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange?.(value.filter((t) => t !== tag));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 shadow-xs transition-all focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        className
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="outline">
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-sm text-destructive/50 hover:text-destructive focus:outline-none"
          >
            <X size={14} />
          </button>
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'flex-1 min-w-[100px] bg-transparent outline-none border-none text-base md:text-sm placeholder:text-muted-foreground',
          'file:text-foreground selection:bg-primary selection:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        {...props}
      />
    </div>
  );
};
