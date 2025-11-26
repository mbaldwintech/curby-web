'use client';

import { BroadcastService } from '@core/services';
import { Broadcast } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const baseSchema = z
  .object({
    // General
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .max(100, { message: 'Name must be 100 characters or less' }),
    description: z.string().max(500, { message: 'Description must be 500 characters or less' }).optional(),
    category: z.enum(['general', 'promo', 'system', 'motd', 'event', 'pro_feature']),
    priority: z.number().int().min(0).default(0),
    status: z.enum(['draft', 'scheduled', 'active', 'archived']),
    validFrom: z.date(),
    validTo: z.date().nullable().optional(),

    // Targeting
    audience: z.enum(['all', 'guest', 'registered', 'pro', 'business']),
    platform: z.enum(['all', 'ios', 'android']),
    geoLocation: z.string().nullable().optional(),
    radius: z.number().positive().nullable().optional(),

    // Channels
    sendPush: z.boolean().default(false),
    sendEmail: z.boolean().default(false),

    // Email specific
    emailSubject: z.string().max(200, { message: 'Email subject must be 200 characters or less' }).optional(),
    emailTemplate: z.string().optional(),
    emailPlaceholders: z.record(z.string(), z.unknown()).optional()
  })
  .refine(
    (data) => {
      if (data.validTo && data.validFrom) {
        return data.validTo > data.validFrom;
      }
      return true;
    },
    {
      message: 'Valid To must be after Valid From',
      path: ['validTo']
    }
  )
  .refine(
    (data) => {
      if (data.sendEmail && !data.emailSubject) {
        return false;
      }
      return true;
    },
    {
      message: 'Email subject is required when sending emails',
      path: ['emailSubject']
    }
  );

export type FormValues = z.infer<typeof baseSchema>;

function makeSchema(currentName: string, validateUniqueName: (name: string) => Promise<boolean | string>) {
  return baseSchema.superRefine(async (data, ctx) => {
    if (!data.name || data.name === currentName) return;

    const isValid = await validateUniqueName(data.name);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['name'],
        message: isValid as string
      });
    }
  });
}

const defaultValues: FormValues = {
  name: '',
  description: '',
  category: 'general',
  priority: 0,
  status: 'draft',
  validFrom: new Date(),
  validTo: null,
  audience: 'all',
  platform: 'all',
  geoLocation: null,
  radius: null,
  sendPush: false,
  sendEmail: false,
  emailSubject: '',
  emailTemplate: '',
  emailPlaceholders: {}
};

export interface BroadcastFormProps {
  broadcastId: string | null;
  onSubmitSuccess?: (broadcast: Broadcast) => void;
}

export const useBroadcastForm = ({ broadcastId, onSubmitSuccess }: BroadcastFormProps) => {
  const service = useRef(createClientService(BroadcastService)).current;
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateName = useCallback(
    async (name: string) => {
      try {
        const exists = await service.exists({ column: 'name', operator: 'eq', value: name });
        return !exists || 'This name is already in use';
      } catch (error) {
        console.error('Failed to validate name uniqueness', error);
        return 'Error validating name uniqueness. Please try again.';
      }
    },
    [service]
  );

  const debouncedValidateName = useRef(debounce(validateName, 300, { trailing: true })).current;

  const form = useForm<FormValues>({
    // @ts-expect-error - zodResolver async validation type issue
    resolver: zodResolver(
      makeSchema(broadcast?.name || '', async (name: string) => {
        if (!name || name === broadcast?.name) return true;
        const result = await debouncedValidateName(name);
        return result ?? true;
      })
    ),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (broadcastId) {
      try {
        setLoading(true);
        setError(null);
        const result = await service.getById(broadcastId);
        if (result) {
          setBroadcast(result);
          form.reset({
            name: result.name,
            description: result.description || '',
            category: result.category as FormValues['category'],
            priority: result.priority,
            status: result.status as FormValues['status'],
            validFrom: new Date(result.validFrom),
            validTo: result.validTo ? new Date(result.validTo) : null,
            audience: result.audience as FormValues['audience'],
            platform: result.platform as FormValues['platform'],
            geoLocation: result.geoLocation || null,
            radius: result.radius || null,
            sendPush: result.sendPush,
            sendEmail: result.sendEmail,
            emailSubject: result.emailSubject || '',
            emailTemplate: result.emailTemplate || '',
            emailPlaceholders: result.emailPlaceholders || {}
          });
        }
      } catch (error) {
        console.error('Failed to fetch broadcast', error);
        setError('Failed to load broadcast. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setBroadcast(null);
      form.reset(defaultValues);
    }
  }, [form, service, broadcastId]);

  const reset = useCallback(() => {
    if (broadcast) {
      form.reset({
        name: broadcast.name,
        description: broadcast.description || '',
        category: broadcast.category as FormValues['category'],
        priority: broadcast.priority,
        status: broadcast.status as FormValues['status'],
        validFrom: new Date(broadcast.validFrom),
        validTo: broadcast.validTo ? new Date(broadcast.validTo) : null,
        audience: broadcast.audience as FormValues['audience'],
        platform: broadcast.platform as FormValues['platform'],
        geoLocation: broadcast.geoLocation || null,
        radius: broadcast.radius || null,
        sendPush: broadcast.sendPush,
        sendEmail: broadcast.sendEmail,
        emailSubject: broadcast.emailSubject || '',
        emailTemplate: broadcast.emailTemplate || '',
        emailPlaceholders: broadcast.emailPlaceholders || {}
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, broadcast]);

  const clear = useCallback(() => {
    setBroadcast(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: FormValues) => {
      if (!broadcast) return;
      setSubmitting(true);
      try {
        const updated = await service.update(broadcast.id, data as Partial<Broadcast>);
        if (updated) {
          onSubmitSuccess?.(updated);
          reset();
        }
      } catch (error) {
        console.error('Failed to update broadcast', error);
        setError('Failed to update broadcast. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [broadcast, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const updates = data as unknown as Omit<Broadcast, keyof import('@supa/types').GenericRecord>;
        const created = await service.create({
          ...updates,
          title: updates.title || '',
          body: updates.body || '',
          useMediaInNotification: updates.useMediaInNotification || false,
          isDismissible: updates.isDismissible || true
        });
        if (created) {
          onSubmitSuccess?.(created);
          reset();
        }
      } catch (error) {
        console.error('Failed to create broadcast', error);
        setError('Failed to create broadcast. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (broadcast) {
        await update(data);
      } else {
        await create(data);
      }
    },
    [broadcast, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    broadcast,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
