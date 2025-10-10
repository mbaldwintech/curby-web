'use client';

import { ItemService, ReportedItemService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const ReportedItemCountCell = ({ userId }: { userId?: string | null }) => {
  const itemService = useRef(createClientService(ItemService)).current;
  const reportedItemService = useRef(createClientService(ReportedItemService)).current;
  const [reportedItemCount, setReportedItemCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      itemService
        .getAll({ column: 'postedBy', operator: 'eq', value: userId })
        .then((items) => {
          const itemIds = items.map((item) => item.id);
          if (itemIds.length === 0) {
            setReportedItemCount(0);
            return;
          }
          reportedItemService
            .count({ column: 'itemId', operator: 'in', value: itemIds })
            .then((count) => {
              if (count !== null) {
                setReportedItemCount(count);
              }
            })
            .catch(() => {
              setReportedItemCount(0);
            });
        })
        .catch(() => {
          setReportedItemCount(0);
        });
    } else {
      setReportedItemCount(0);
    }
  }, [userId, itemService, reportedItemService]);

  return reportedItemCount;
};
