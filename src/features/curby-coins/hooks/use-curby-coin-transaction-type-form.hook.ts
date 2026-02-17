'use client';

import { CurbyCoinTransactionTypeService } from '@core/services';
import { Condition, CurbyCoinTransactionType } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { createLogger, debounce } from '@core/utils';

const logger = createLogger('UseCurbyCoinTransactionTypeForm');

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
  eventTypeId: z.string().min(1, { error: 'Event Type is required' }).nonempty().nonoptional(),
  category: z
    .string()
    .min(1, { error: 'Category is required' })
    .max(50, { error: 'Category must be 50 characters or less' })
    .nonempty()
    .nonoptional(),
  recipient: z
    .string()
    .min(1, { error: 'Recipient is required' })
    .max(100, { error: 'Recipient must be 100 characters or less' })
    .nonempty()
    .nonoptional(),
  sortOrder: z.number().int().min(0, { error: 'Sort Order must be at least 0' }).nonoptional(),
  displayName: z
    .string()
    .min(1, { error: 'Display Name is required' })
    .max(100, { error: 'Display Name must be 100 characters or less' })
    .nonempty()
    .nonoptional(),
  description: z.string().max(500, { error: 'Description must be 500 characters or less' }).optional(),
  amount: z.number().int().min(1, { error: 'Amount must be at least 1' }).nonoptional(),
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
  eventTypeId: '',
  category: '',
  recipient: '',
  sortOrder: 0,
  displayName: '',
  description: '',
  amount: 1,
  validFrom: new Date(),
  validTo: undefined,
  max: undefined,
  maxPerDay: undefined,
  condition: undefined,
  active: true
};

export interface CurbyCoinTransactionTypeFormProps {
  curbyCoinTransactionTypeId: string | null;
  onSubmitSuccess?: (curbyCoinTransactionType: CurbyCoinTransactionType) => void;
}

export const useCurbyCoinTransactionTypeForm = ({
  curbyCoinTransactionTypeId,
  onSubmitSuccess
}: CurbyCoinTransactionTypeFormProps) => {
  const service = useRef(createClientService(CurbyCoinTransactionTypeService)).current;
  const [curbyCoinTransactionType, setCurbyCoinTransactionType] = useState<CurbyCoinTransactionType | null>(null);
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
      makeSchema(curbyCoinTransactionType?.key || '', async (key: string, currentKey?: string) => {
        if (!key || key === currentKey) return true;
        return debouncedValidateKey(key);
      })
    ),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (curbyCoinTransactionTypeId) {
      try {
        setLoading(true);
        const curbyCoinTransactionType = await service.getById(curbyCoinTransactionTypeId);
        setCurbyCoinTransactionType(curbyCoinTransactionType);
        form.reset({
          key: curbyCoinTransactionType.key,
          eventTypeId: curbyCoinTransactionType.eventTypeId,
          category: curbyCoinTransactionType.category,
          recipient: curbyCoinTransactionType.recipient,
          sortOrder: curbyCoinTransactionType.sortOrder,
          displayName: curbyCoinTransactionType.displayName,
          description: curbyCoinTransactionType.description || '',
          amount: curbyCoinTransactionType.amount,
          validFrom: new Date(curbyCoinTransactionType.validFrom),
          validTo: curbyCoinTransactionType.validTo ? new Date(curbyCoinTransactionType.validTo) : undefined,
          max: curbyCoinTransactionType.max || undefined,
          maxPerDay: curbyCoinTransactionType.maxPerDay || undefined,
          condition: curbyCoinTransactionType.condition
            ? {
                ...curbyCoinTransactionType.condition,
                params: curbyCoinTransactionType.condition.params
                  ? JSON.stringify(curbyCoinTransactionType.condition.params)
                  : undefined
              }
            : undefined,
          active: curbyCoinTransactionType.active
        });
      } catch (error) {
        logger.error('Failed to fetch curby coin transaction type details:', error);
        setCurbyCoinTransactionType(null);
        form.reset(defaultValues);
        setError('Failed to load curby coin transaction type details.');
      } finally {
        setLoading(false);
      }
    } else {
      setCurbyCoinTransactionType(null);
      form.reset(defaultValues);
    }
  }, [form, service, curbyCoinTransactionTypeId]);

  const reset = useCallback(() => {
    if (curbyCoinTransactionType) {
      form.reset({
        key: curbyCoinTransactionType.key
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, curbyCoinTransactionType]);

  const clear = useCallback(() => {
    setCurbyCoinTransactionType(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: FormValues) => {
      if (!curbyCoinTransactionType) return;
      setSubmitting(true);
      try {
        const updatedCurbyCoinTransactionType = await service.update(curbyCoinTransactionType.id, {
          ...data,
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('Curby coin transaction type updated successfully');
        onSubmitSuccess?.(updatedCurbyCoinTransactionType);
        reset();
      } catch (error) {
        logger.error('Failed to update curby coin transaction type:', error);
        toast.error('Failed to update curby coin transaction type. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [curbyCoinTransactionType, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const createdCurbyCoinTransactionType = await service.create({
          ...data,
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('Curby coin transaction type created successfully');
        onSubmitSuccess?.(createdCurbyCoinTransactionType);
        reset();
      } catch (error) {
        logger.error('Failed to create curby coin transaction type:', error);
        toast.error('Failed to create curby coin transaction type. Please try again.');
        setError('Failed to create curby coin transaction type. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (curbyCoinTransactionType) {
        update(data);
      } else {
        create(data);
      }
    },
    [curbyCoinTransactionType, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    curbyCoinTransactionType,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
