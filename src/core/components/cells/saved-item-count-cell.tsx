'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { SavedItemService } from '../../services';

export const SavedItemCountCell = ({ userId }: { userId?: string | null }) => {
  const savedItemService = useRef(createClientService(SavedItemService)).current;
  const [savedItemCount, setSavedItemCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      savedItemService
        .count({ column: 'userId', operator: 'eq', value: userId })
        .then((count) => {
          if (count !== null) {
            setSavedItemCount(count);
          }
        })
        .catch(() => {
          setSavedItemCount(0);
        });
    } else {
      setSavedItemCount(0);
    }
  }, [userId, savedItemService]);

  return savedItemCount;
};
