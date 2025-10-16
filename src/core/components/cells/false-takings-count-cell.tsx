'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { FalseTakingService } from '../../services';

export const FalseTakingsCountCell = ({ userId }: { userId?: string | null }) => {
  const falseTakingService = useRef(createClientService(FalseTakingService)).current;
  const [falseTakingsCount, setFalseTakingsCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      falseTakingService
        .count({ column: 'takerId', operator: 'eq', value: userId })
        .then((count) => {
          if (count !== null) {
            setFalseTakingsCount(count);
          }
        })
        .catch(() => {
          setFalseTakingsCount(0);
        });
    } else {
      setFalseTakingsCount(0);
    }
  }, [userId, falseTakingService]);

  return falseTakingsCount;
};
