'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../../hooks';
import { cn } from '../../utils';
import { Button, ButtonProps } from './button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface Item {
  id: string;
  label: string;
}

const AutocompleteItem = React.memo(
  function AutocompleteItem({ item, isSelected, onSelect }: { item: Item; isSelected: boolean; onSelect: () => void }) {
    return (
      <CommandItem key={item.id} onSelect={onSelect}>
        <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
        {item.label}
      </CommandItem>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected && prev.item.id === next.item.id
);

export interface AutocompleteProps extends Omit<ButtonProps, 'value' | 'onSelect'> {
  value?: string | null;
  onSelect: (id: string | null) => void;
  pageSize: number;
  getCount: (query: string) => Promise<number>;
  fetchItems: (query: string, page: number, pageSize: number) => Promise<Item[]>;
  fetchSelectedItem?: (id: string) => Promise<Item | null>;
  placeholder?: string;
}

export function Autocomplete({
  value,
  onSelect,
  pageSize,
  getCount,
  fetchItems,
  fetchSelectedItem,
  placeholder,
  ...rest
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const hasMore = useMemo(() => {
    return totalCount !== null && pageSize ? (page + 1) * pageSize < totalCount : false;
  }, [page, pageSize, totalCount]);
  const [selected, setSelected] = useState<Item | null>(null);

  // Fetch total count if available
  useEffect(() => {
    if (getCount) {
      getCount(debouncedQuery)
        .then((count) => {
          setTotalCount(count);
        })
        .catch(() => setTotalCount(null));
    } else {
      setTotalCount(null);
    }
  }, [debouncedQuery, getCount]);

  // Fetch data when query or page changes
  useEffect(() => {
    setLoading(true);
    fetchItems(debouncedQuery, page, pageSize)
      .then((result) => {
        if (page === 0) {
          setItems(result); // overwrite on fresh search
        } else {
          setItems((prev) => {
            const existing = new Map(prev.map((i) => [i.id, i]));
            result.forEach((i) => existing.set(i.id, i));
            return Array.from(existing.values());
          });
        }
      })
      .finally(() => setLoading(false));
  }, [fetchItems, debouncedQuery, page, pageSize]);

  useEffect(() => {
    if (value == null) {
      setSelected(null);
      return;
    }
    if (items.find((i) => i.id === value)) {
      setSelected(items.find((i) => i.id === value) || null);
      return;
    }
    if (fetchSelectedItem) {
      fetchSelectedItem(value)
        .then((item) => {
          if (item) {
            setSelected(item);
            setItems((prev) => {
              const existing = new Map(prev.map((i) => [i.id, i]));
              existing.set(item.id, item);
              return Array.from(existing.values());
            });
          } else {
            setSelected(null);
          }
        })
        .catch(() => setSelected(null));
      return;
    }
    setSelected(value ? { id: value, label: value } : null);
  }, [value, fetchSelectedItem, items]);

  const handleSelect = useCallback(
    (item: Item) => {
      if (item.id !== selected?.id) {
        setSelected(item);
        onSelect(item.id);
        setOpen(false);
      } else {
        setSelected(null);
        onSelect(null);
        setOpen(false);
      }
    },
    [selected, onSelect]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" {...rest}>
          <span className="truncate flex-grow text-left">
            {selected ? selected.label : placeholder ? placeholder : 'Select item...'}
          </span>
          {selected && (
            <div
              className="flex items-center gap-1 rounded-md hover:bg-destructive text-destructive hover:text-primary p-1"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
                onSelect(null);
              }}
            >
              <X className="h-4 w-4" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[250px]">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={query}
            onValueChange={(search) => {
              setPage(0);
              setQuery(search);
            }}
          />
          <div
            className="overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandList className="max-h-none overflow-visible">
              {items.map((item) => (
                <AutocompleteItem
                  key={item.id}
                  item={item}
                  isSelected={selected?.id === item.id}
                  onSelect={() => handleSelect(item)}
                />
              ))}
              {loading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
              {!loading && items.length === 0 && <CommandEmpty>No results.</CommandEmpty>}
              {!loading && hasMore && (
                <CommandItem
                  className="text-center text-sm text-muted-foreground cursor-pointer"
                  onSelect={() => setPage((prev) => prev + 1)}
                >
                  Load more...
                </CommandItem>
              )}
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
