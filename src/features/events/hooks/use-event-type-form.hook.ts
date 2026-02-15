'use client';

import { EventTypeService } from '@core/services';
import { Condition, EventType } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { createLogger, debounce } from '@core/utils';

const logger = createLogger('UseEventTypeForm');

const ConditionSchema = z.object({
  type: z.enum(['sql']).nonoptional(),
  label: z.string().min(1, { error: 'Condition label is required' }).nonempty().nonoptional(),
  query: z.string().min(1, { error: 'Condition query is required' }).nonempty().nonoptional(),
  params: z.string().optional()
});

const baseSchema = z.object({
  key: z
    .string()
    .min(1, { error: 'Key is required' })
    .max(100, { error: 'Key must be 100 characters or less' })
    .nonempty()
    .nonoptional()
    .refine((s) => !s.includes(' '), {
      error: 'String cannot contain any spaces'
    }),
  category: z
    .string()
    .min(1, { error: 'Category is required' })
    .max(50, { error: 'Category must be 50 characters or less' })
    .nonempty()
    .nonoptional(),
  name: z.string().min(1, { error: 'Name is required' }).nonempty().nonoptional(),
  description: z.string().max(500, { error: 'Description must be 500 characters or less' }).optional(),
  validFrom: z
    .date({
      error: 'Valid From must be a valid date'
    })
    .nonoptional({ error: 'Valid From date is required' }),
  validTo: z.date({ error: 'Valid To must be a valid date' }).optional(),
  max: z.number().int().min(1, { error: 'Max must be at least 1' }).optional(),
  maxPerDay: z.number().int().min(1, { error: 'Max Per Day must be at least 1' }).optional(),
  condition: ConditionSchema.optional(),
  active: z.boolean()
});

export type FormValues = z.infer<typeof baseSchema>;

function makeSchema(currentKey: string, validateUniqueKey: (key: string) => Promise<boolean | string>) {
  return baseSchema.superRefine(async (data, ctx) => {
    if (!data.key || data.key === currentKey) return;

    const isValid = await validateUniqueKey(data.key);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['key'],
        message: isValid as string
      });
    }
  });
}

const defaultValues = {
  key: '',
  category: '',
  name: '',
  description: '',
  validFrom: new Date(),
  validTo: undefined,
  max: undefined,
  maxPerDay: undefined,
  condition: undefined,
  active: true
};

export interface EventTypeFormProps {
  eventTypeId: string | null;
  onSubmitSuccess?: (eventType: EventType) => void;
}

export const useEventTypeForm = ({ eventTypeId, onSubmitSuccess }: EventTypeFormProps) => {
  const service = useRef(createClientService(EventTypeService)).current;
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateKey = useCallback(
    async (key: string) => {
      try {
        const exists = await service.exists({ column: 'key', operator: 'eq', value: key });
        return !exists || 'This key is already in use';
      } catch (error) {
        logger.error('Failed to validate key uniqueness', error);
        return 'Error validating key uniqueness. Please try again.';
      }
    },
    [service]
  );

  const debouncedValidateKey = useRef(debounce(validateKey, 300, { trailing: true })).current;

  const form = useForm<FormValues>({
    resolver: zodResolver(
      makeSchema(eventType?.key || '', async (key: string, currentKey?: string) => {
        if (!key || key === currentKey) return true;
        return debouncedValidateKey(key);
      })
    ),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (eventTypeId) {
      try {
        setLoading(true);
        const eventType = await service.getById(eventTypeId);
        setEventType(eventType);
        form.reset({
          key: eventType.key,
          category: eventType.category,
          name: eventType.name,
          description: eventType.description || '',
          validFrom: new Date(eventType.validFrom),
          validTo: eventType.validTo ? new Date(eventType.validTo) : undefined,
          max: eventType.max || undefined,
          maxPerDay: eventType.maxPerDay || undefined,
          condition: eventType.condition
            ? {
                ...eventType.condition,
                params: eventType.condition.params ? JSON.stringify(eventType.condition.params) : undefined
              }
            : undefined,
          active: eventType.active
        });
      } catch (error) {
        logger.error('Failed to fetch eventType details:', error);
        setEventType(null);
        form.reset(defaultValues);
        setError('Failed to load eventType details.');
      } finally {
        setLoading(false);
      }
    } else {
      setEventType(null);
      form.reset(defaultValues);
    }
  }, [form, service, eventTypeId]);

  const reset = useCallback(() => {
    if (eventType) {
      form.reset({
        key: eventType.key
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, eventType]);

  const clear = useCallback(() => {
    setEventType(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: FormValues) => {
      if (!eventType) return;
      setSubmitting(true);
      try {
        const updatedEventType = await service.update(eventType.id, {
          ...data,
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('EventType updated successfully');
        onSubmitSuccess?.(updatedEventType);
        reset();
      } catch (error) {
        logger.error('Failed to update eventType:', error);
        toast.error('Failed to update eventType. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [eventType, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const createdEventType = await service.create({
          ...data,
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('EventType created successfully');
        onSubmitSuccess?.(createdEventType);
        reset();
      } catch (error) {
        logger.error('Failed to create eventType:', error);
        toast.error('Failed to create eventType. Please try again.');
        setError('Failed to create eventType. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (eventType) {
        update(data);
      } else {
        create(data);
      }
    },
    [eventType, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    eventType,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
