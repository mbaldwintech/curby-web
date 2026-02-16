'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

type CountFilter = {
  column: string;
  operator: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

type CountableService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count: (filters?: any) => Promise<number>;
};

type CountCellProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: new (supabase: SupabaseClient, ...args: any[]) => CountableService;
  id?: string | null;
  filters: CountFilter | CountFilter[];
};

export const CountCell = ({ service, id, filters }: CountCellProps) => {
  const serviceInstance = useRef(createClientService(service)).current;
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (id) {
      serviceInstance
        .count(filters)
        .then((result) => {
          if (result !== null) {
            setCount(result);
          }
        })
        .catch(() => {
          setCount(0);
        });
    } else {
      setCount(0);
    }
  }, [id, serviceInstance, filters]);

  return count;
};
