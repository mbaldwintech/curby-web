import { Autocomplete, AutocompleteProps } from '@core/components';
import { CurbyCoinTransactionTypeService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useRef } from 'react';

export type CurbyCoinTransactionTypeSelectProps = Omit<AutocompleteProps, 'getCount' | 'fetchItems' | 'pageSize'>;

export const CurbyCoinTransactionTypeSelect = ({ value, onSelect, ...rest }: CurbyCoinTransactionTypeSelectProps) => {
  const curbyCoinTransactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;

  return (
    <Autocomplete
      {...rest}
      value={value}
      pageSize={10}
      getCount={async (query: string) => {
        return curbyCoinTransactionTypeService.count(
          undefined,
          query ? { text: query, columns: ['displayName'] } : undefined
        );
      }}
      fetchItems={async (query: string, page: number, pageSize: number) => {
        const items = await curbyCoinTransactionTypeService.getAllPaged(
          undefined,
          { column: 'displayName', ascending: true },
          { pageIndex: page, pageSize },
          query ? { text: query, columns: ['displayName'] } : undefined
        );
        return items.map((item) => ({
          id: item.id,
          label: item.displayName
        }));
      }}
      fetchSelectedItem={async (id: string) => {
        const item = await curbyCoinTransactionTypeService.getById(id);
        if (item) {
          return { id: item.id, label: item.displayName };
        }
        return null;
      }}
      onSelect={(value) => {
        onSelect(value ?? null);
      }}
    />
  );
};
