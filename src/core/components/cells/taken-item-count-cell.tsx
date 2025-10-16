'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { ItemService } from '../../services';

export const TakenItemCountCell = ({ userId }: { userId?: string | null }) => {
  const itemService = useRef(createClientService(ItemService)).current;
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      itemService
        .count({ column: 'takenBy', operator: 'eq', value: userId })
        .then((count) => {
          if (count !== null) {
            setItemCount(count);
          }
        })
        .catch(() => {
          setItemCount(0);
        });
    } else {
      setItemCount(0);
    }
  }, [userId, itemService]);

  return itemCount;
};
