'use client';

import { Autocomplete, AutocompleteProps } from '@core/components';
import { ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { useRef } from 'react';

export type UserSelectProps = Omit<AutocompleteProps, 'getCount' | 'fetchItems' | 'fetchSelectedItem' | 'pageSize'> & {
  filters?: Filters<Profile>;
};

export const UserSelect = ({ value, onSelect, filters, ...rest }: UserSelectProps) => {
  const profileService = useRef(createClientService(ProfileService)).current;

  return (
    <Autocomplete
      {...rest}
      value={value}
      pageSize={10}
      getCount={async (query: string) => {
        return profileService.count(filters ?? undefined, query ? { text: query, columns: ['username'] } : undefined);
      }}
      fetchItems={async (query: string, page: number, pageSize: number) => {
        const items = await profileService.getAllPaged(
          filters ?? undefined,
          { column: 'username', ascending: true },
          { pageIndex: page, pageSize },
          query ? { text: query, columns: ['username'] } : undefined
        );
        return items.map((item) => ({
          id: item.userId,
          label: item.username
        }));
      }}
      fetchSelectedItem={async (userId: string) => {
        const item = await profileService.findByUserId(userId);
        if (item) {
          return { id: item.userId, label: item.username };
        }
        return null;
      }}
      onSelect={(value) => {
        onSelect(value ?? null);
      }}
    />
  );
};
