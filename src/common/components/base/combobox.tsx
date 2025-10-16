'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../utils';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export function Combobox({
  value,
  onChange,
  placeholder,
  options
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: ({ label: string; value: string } | string)[];
}) {
  const [open, setOpen] = React.useState(false);

  const getDisplayValue = (val: string) => {
    const option = options.find((opt) => (typeof opt === 'string' ? opt === val : opt.value === val));
    return option ? (typeof option === 'string' ? option : option.label) : '';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value ? getDisplayValue(value) : (placeholder ?? 'Select an option...')}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder ?? 'Select an option...'} />
          <CommandList>
            <CommandEmpty>Not found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={typeof opt === 'string' ? opt : opt.value}
                  value={typeof opt === 'string' ? opt : opt.value}
                  onSelect={(currentValue) => {
                    onChange?.(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      (typeof opt === 'string' ? value === opt : value === opt.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {typeof opt === 'string' ? opt : opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
