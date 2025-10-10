'use client';

import { ReportedItemService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const SubmittedReportsCountCell = ({ userId }: { userId?: string | null }) => {
  const reportedItemService = useRef(createClientService(ReportedItemService)).current;
  const [reportedItemCount, setReportedItemCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      reportedItemService
        .count({ column: 'reporterId', operator: 'eq', value: userId })
        .then((count) => {
          if (count !== null) {
            setReportedItemCount(count);
          }
        })
        .catch(() => {
          setReportedItemCount(0);
        });
    } else {
      setReportedItemCount(0);
    }
  }, [userId, reportedItemService]);

  return reportedItemCount;
};
