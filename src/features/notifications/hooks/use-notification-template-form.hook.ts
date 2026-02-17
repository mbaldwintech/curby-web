'use client';

import { NotificationTemplateService } from '@core/services';
import { Condition, NotificationTemplate } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { createLogger, debounce } from '@core/utils';

const logger = createLogger('UseNotificationTemplateForm');

const ConditionSchema = z.object({
  type: z.enum(['sql']).nonoptional(),
  label: z.string().min(1, { error: 'Condition label is required' }).nonempty().nonoptional(),
  query: z.string().min(1, { error: 'Condition query is required' }).nonempty().nonoptional(),
  params: z.string().optional()
});

const IconPropsSchema = z.union([
  z.object({
    lib: z.literal('Ionicons').optional(),
    name: z.string().min(1, { error: 'Icon name is required' }).nonempty().nonoptional(),
    size: z.number().optional(),
    colorClass: z.string().optional(),
    className: z.string().optional(),
    backgroundColor: z.string().optional()
  }),
  z.object({
    lib: z.literal('MaterialIcons'),
    name: z.string().min(1, { error: 'Icon name is required' }).nonempty().nonoptional(),
    size: z.number().optional(),
    colorClass: z.string().optional(),
    className: z.string().optional(),
    backgroundColor: z.string().optional()
  }),
  z.object({
    lib: z.literal('MaterialCommunityIcons'),
    name: z.string().min(1, { error: 'Icon name is required' }).nonempty().nonoptional(),
    size: z.number().optional(),
    colorClass: z.string().optional(),
    className: z.string().optional(),
    backgroundColor: z.string().optional()
  })
]);

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
  version: z.number().int().min(1, { error: 'Version must be at least 1' }).nonoptional(),
  eventTypeId: z.string().optional(),
  curbyCoinTransactionTypeId: z.string().optional(),
  recipient: z
    .string()
    .min(1, { error: 'Recipient is required' })
    .max(50, { error: 'Recipient must be 50 characters or less' })
    .nonempty()
    .nonoptional(),
  deliveryChannel: z
    .string()
    .min(1, { error: 'Delivery Channel is required' })
    .max(50, { error: 'Delivery Channel must be 50 characters or less' })
    .nonempty()
    .nonoptional(),
  category: z
    .string()
    .min(1, { error: 'Category is required' })
    .max(50, { error: 'Category must be 50 characters or less' })
    .nonempty()
    .nonoptional(),
  titleTemplate: z.string().optional(),
  bodyTemplate: z.string().optional(),
  targetRoute: z.string().optional(),
  iconProps: IconPropsSchema.optional(),
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
  version: 1,
  eventTypeId: undefined,
  curbyCoinTransactionTypeId: undefined,
  recipient: '',
  deliveryChannel: '',
  category: '',
  titleTemplate: '',
  bodyTemplate: '',
  targetRoute: '',
  iconProps: undefined,
  validFrom: new Date(),
  validTo: undefined,
  max: undefined,
  maxPerDay: undefined,
  condition: undefined,
  active: true
};

export interface NotificationTemplateFormProps {
  notificationTemplateId: string | null;
  onSubmitSuccess?: (notificationTemplate: NotificationTemplate) => void;
}

export const useNotificationTemplateForm = ({
  notificationTemplateId,
  onSubmitSuccess
}: NotificationTemplateFormProps) => {
  const service = useRef(createClientService(NotificationTemplateService)).current;
  const [notificationTemplate, setNotificationTemplate] = useState<NotificationTemplate | null>(null);
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
      makeSchema(notificationTemplate?.key || '', async (key: string, currentKey?: string) => {
        if (!key || key === currentKey) return true;
        return debouncedValidateKey(key);
      })
    ),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (notificationTemplateId) {
      try {
        setLoading(true);
        const notificationTemplate = await service.getById(notificationTemplateId);
        setNotificationTemplate(notificationTemplate);
        form.reset({
          key: notificationTemplate.key,
          version: notificationTemplate.version,
          eventTypeId: notificationTemplate.eventTypeId || undefined,
          curbyCoinTransactionTypeId: notificationTemplate.curbyCoinTransactionTypeId || undefined,
          recipient: notificationTemplate.recipient,
          deliveryChannel: notificationTemplate.deliveryChannel,
          category: notificationTemplate.category,
          titleTemplate: notificationTemplate.titleTemplate || '',
          bodyTemplate: notificationTemplate.bodyTemplate || '',
          targetRoute: notificationTemplate.targetRoute || '',
          iconProps: notificationTemplate.iconProps || undefined,
          validFrom: new Date(notificationTemplate.validFrom),
          validTo: notificationTemplate.validTo ? new Date(notificationTemplate.validTo) : undefined,
          max: notificationTemplate.max || undefined,
          maxPerDay: notificationTemplate.maxPerDay || undefined,
          condition: notificationTemplate.condition
            ? {
                ...notificationTemplate.condition,
                params: notificationTemplate.condition.params
                  ? JSON.stringify(notificationTemplate.condition.params)
                  : undefined
              }
            : undefined,
          active: notificationTemplate.active
        });
      } catch (error) {
        logger.error('Failed to fetch notificationTemplate details:', error);
        setNotificationTemplate(null);
        form.reset(defaultValues);
        setError('Failed to load notification template details.');
      } finally {
        setLoading(false);
      }
    } else {
      setNotificationTemplate(null);
      form.reset(defaultValues);
    }
  }, [form, service, notificationTemplateId]);

  const reset = useCallback(() => {
    if (notificationTemplate) {
      form.reset({
        key: notificationTemplate.key
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, notificationTemplate]);

  const clear = useCallback(() => {
    setNotificationTemplate(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: FormValues) => {
      if (!notificationTemplate) return;
      setSubmitting(true);
      try {
        const updatedNotificationTemplate = await service.update(notificationTemplate.id, {
          ...data,
          iconProps: data.iconProps as NotificationTemplate['iconProps'],
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('Notification Template updated successfully');
        onSubmitSuccess?.(updatedNotificationTemplate);
        reset();
      } catch (error) {
        logger.error('Failed to update notificationTemplate:', error);
        toast.error('Failed to update notification template. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [notificationTemplate, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const createdNotificationTemplate = await service.create({
          ...data,
          iconProps: data.iconProps as NotificationTemplate['iconProps'],
          condition: (data.condition
            ? { ...data.condition, params: data.condition.params ? JSON.parse(data.condition.params) : {} }
            : undefined) as Condition | undefined
        });
        toast.success('Notification Template created successfully');
        onSubmitSuccess?.(createdNotificationTemplate);
        reset();
      } catch (error) {
        logger.error('Failed to create notification template:', error);
        toast.error('Failed to create notification template. Please try again.');
        setError('Failed to create notification template. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (notificationTemplate) {
        update(data);
      } else {
        create(data);
      }
    },
    [notificationTemplate, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    notificationTemplate,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
