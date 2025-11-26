'use client';

import { ScheduleService } from '@core/services';
import { Schedule } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const ScheduleCell = ({ scheduleId }: { scheduleId?: string | null }) => {
  const scheduleService = useRef(createClientService(ScheduleService)).current;
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (scheduleId) {
      scheduleService
        .getOneOrNull({ column: 'id', operator: 'eq', value: scheduleId }, 'createdAt', false)
        .then((schedule) => {
          if (schedule !== null) {
            setSchedule(schedule);
          }
        })
        .catch(() => {
          setSchedule(null);
        });
    } else {
      setSchedule(null);
    }
  }, [scheduleId, scheduleService]);

  if (!scheduleId || !schedule) {
    return null;
  }

  return schedule.name;
};
