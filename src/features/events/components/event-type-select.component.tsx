import { Autocomplete, AutocompleteProps } from '@core/components';
import { EventTypeService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useRef } from 'react';

export type EventTypeSelectProps = Omit<
  AutocompleteProps,
  'getCount' | 'fetchItems' | 'fetchSelectedItem' | 'pageSize'
>;

export const EventTypeSelect = ({ value, onSelect, ...rest }: EventTypeSelectProps) => {
  const eventTypeService = useRef(createClientService(EventTypeService)).current;

  return (
    <Autocomplete
      {...rest}
      value={value ?? null}
      pageSize={10}
      getCount={async (query: string) => {
        return eventTypeService.count(undefined, query ? { text: query, columns: ['name'] } : undefined);
      }}
      fetchItems={async (query: string, page: number, pageSize: number) => {
        const items = await eventTypeService.getAllPaged(
          undefined,
          { column: 'name', ascending: true },
          { pageIndex: page, pageSize },
          query ? { text: query, columns: ['name'] } : undefined
        );
        return items.map((item) => ({
          id: item.id,
          label: item.name
        }));
      }}
      fetchSelectedItem={async (id: string) => {
        const item = await eventTypeService.getById(id);
        if (item) {
          return { id: item.id, label: item.name };
        }
        return null;
      }}
      onSelect={(selected) => {
        onSelect(selected ?? undefined);
      }}
    />
  );
};
