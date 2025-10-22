'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { cn } from '../../utils';
import { Button, ButtonProps } from './button';
import { Checkbox } from './checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// ---------- Types ----------
export type Option = {
  value: string;
  label: string;
  description?: string;
};

type MultiSelectProps<TFieldValues extends FieldValues, TFieldName extends Path<TFieldValues>> = {
  name: TFieldName;
  control: Control<TFieldValues>;
  options: Option[];
  placeholder?: string;
  maxSelections?: number;
  variant?: ButtonProps['variant'];
};

// ---------- MultiSelect Component ----------
export function MultiSelect<TFieldValues extends FieldValues, TFieldName extends Path<TFieldValues>>({
  name,
  control,
  options,
  placeholder = 'Select...',
  maxSelections,
  variant
}: MultiSelectProps<TFieldValues, TFieldName>) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[] as PathValue<TFieldValues, TFieldName>}
      render={({ field, fieldState }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const isInvalid = fieldState.invalid;

        const isSelected = (val: string) => selected.includes(val);

        const toggle = (val: string) => {
          let next: string[];
          if (isSelected(val)) next = selected.filter((s) => s !== val);
          else next = [...selected, val];

          if (maxSelections && next.length > maxSelections) return;

          field.onChange(next);
        };

        const clear = () => field.onChange([]);

        return (
          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  aria-invalid={isInvalid}
                  data-slot="input"
                  className={cn(
                    'w-full justify-start items-start h-auto min-h-[2.5rem] p-2',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive'
                  )}
                  variant={variant ?? 'outline'}
                >
                  <div className="flex-1 max-h-24 overflow-y-auto">
                    {selected.length === 0 ? (
                      <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selected.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full border bg-muted/50"
                          >
                            {options.find((o) => o.value === val)?.label ?? val}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className={cn(
                                'p-0 h-4 w-4 bg-destructive/10 text-destructive hover:bg-destructive/20',
                                'focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:text-destructive/60',
                                'dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 rounded-full'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(val);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-2 flex flex-col items-end gap-1 flex-shrink-0">
                    {selected.length > 0 && (
                      <div className="text-xs text-muted-foreground">{selected.length} selected</div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[300px] p-0" align="start">
                <div
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Command>
                    <CommandInput placeholder="Type to filter..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No results.</CommandEmpty>

                      <CommandGroup>
                        {options.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => toggle(opt.value)}
                            className={cn('flex items-start gap-2 p-2', isSelected(opt.value) && 'bg-muted')}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <Checkbox
                                checked={isSelected(opt.value)}
                                onCheckedChange={() => toggle(opt.value)}
                                aria-hidden
                              />
                            </div>

                            <div className="flex flex-col">
                              <span className="text-sm">{opt.label}</span>
                              {opt.description && (
                                <span className="text-xs text-muted-foreground">{opt.description}</span>
                              )}
                            </div>

                            {isSelected(opt.value) && (
                              <div className="ml-auto">
                                <Check size={16} />
                              </div>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>

                  <div className="flex items-center justify-between px-3 py-2 border-t">
                    <div className="text-xs text-muted-foreground">{options.length} options</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={clear}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      }}
    />
  );
}
