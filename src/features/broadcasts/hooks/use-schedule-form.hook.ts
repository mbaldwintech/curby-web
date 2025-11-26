'use client';

import { ScheduleService } from '@core/services';
import { Schedule } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const baseSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .max(100, { message: 'Name must be 100 characters or less' }),
    description: z.string().max(500, { message: 'Description must be 500 characters or less' }).optional(),
    dtStart: z.date(),
    dtEnd: z.date().nullable().optional(),
    timezone: z.string().default('UTC'),
    rrule: z.string().nullable().optional(),
    active: z.boolean().default(true)
  })
  .refine(
    (data) => {
      if (data.dtEnd && data.dtStart) {
        return data.dtEnd > data.dtStart;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['dtEnd']
    }
  );

export type ScheduleFormValues = z.infer<typeof baseSchema>;

const defaultValues: ScheduleFormValues = {
  name: '',
  description: '',
  dtStart: new Date(),
  dtEnd: null,
  timezone: 'UTC',
  rrule: null,
  active: true
};

export interface ScheduleFormProps {
  scheduleId: string | null;
  broadcastId: string;
  onSubmitSuccess?: (schedule: Schedule) => void;
}

export const useScheduleForm = ({ scheduleId, broadcastId, onSubmitSuccess }: ScheduleFormProps) => {
  const service = useRef(createClientService(ScheduleService)).current;
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ScheduleFormValues>({
    // @ts-expect-error - zodResolver type inference with defaults
    resolver: zodResolver(baseSchema),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (scheduleId) {
      try {
        setLoading(true);
        setError(null);
        const result = await service.getById(scheduleId);
        if (result) {
          setSchedule(result);
          form.reset({
            name: result.name,
            description: result.description || '',
            dtStart: new Date(result.dtStart),
            dtEnd: result.dtEnd ? new Date(result.dtEnd) : null,
            timezone: result.timezone || 'UTC',
            rrule: result.rrule || null,
            active: result.active
          });
        }
      } catch (error) {
        console.error('Failed to fetch schedule', error);
        setError('Failed to load schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setSchedule(null);
      form.reset(defaultValues);
    }
  }, [form, service, scheduleId]);

  const reset = useCallback(() => {
    if (schedule) {
      form.reset({
        name: schedule.name,
        description: schedule.description || '',
        dtStart: new Date(schedule.dtStart),
        dtEnd: schedule.dtEnd ? new Date(schedule.dtEnd) : null,
        timezone: schedule.timezone || 'UTC',
        rrule: schedule.rrule || null,
        active: schedule.active
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, schedule]);

  const clear = useCallback(() => {
    setSchedule(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: ScheduleFormValues) => {
      if (!schedule) return;
      setSubmitting(true);
      try {
        const updated = await service.update(schedule.id, data as Partial<Schedule>);
        if (updated) {
          onSubmitSuccess?.(updated);
          reset();
        }
      } catch (error) {
        console.error('Failed to update schedule', error);
        setError('Failed to update schedule. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [schedule, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: ScheduleFormValues) => {
      setSubmitting(true);
      try {
        const uid = `broadcast-${broadcastId}-${Date.now()}`;
        const scheduleData = {
          ...data,
          uid,
          ownerType: 'broadcast',
          ownerId: broadcastId
        };
        const created = await service.create(
          scheduleData as unknown as Omit<Schedule, keyof import('@supa/types').GenericRecord>
        );
        if (created) {
          onSubmitSuccess?.(created);
          reset();
        }
      } catch (error) {
        console.error('Failed to create schedule', error);
        setError('Failed to create schedule. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [broadcastId, onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: ScheduleFormValues) => {
      if (submitting) return;
      if (schedule) {
        await update(data);
      } else {
        await create(data);
      }
    },
    [schedule, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    schedule,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
