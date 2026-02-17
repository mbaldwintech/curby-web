import { HeaderContext } from '@tanstack/react-table';
import { Autocomplete } from './autocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import type {
  DistinctFilterComponentOptions,
  FilterComponent,
  PagedAutocompleteFilterComponentOptions
} from './data-table-types';

export function getPagedAutocompleteFilterComponent<TData, TValue>(
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
        fetchSelectedItem={options.fetchSelectedItem}
        onSelect={(value) => {
          column.setFilterValue(value === null ? 'null' : value || undefined);
        }}
        nullable={options.nullable}
        nullValueLabel={options.nullValueLabel}
      />
    );
  };
}

export async function getDistinctFilterComponent<TData, TValue>(
  options: DistinctFilterComponentOptions<TValue>
): Promise<FilterComponent<TData, TValue>> {
  const distinctValues = await options.getOptions();
  return function DistinctFilter(header: HeaderContext<TData, TValue>) {
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
